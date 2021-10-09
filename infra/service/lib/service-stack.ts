import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as iam from '@aws-cdk/aws-iam'
import * as logs from '@aws-cdk/aws-logs'
import * as alb from '@aws-cdk/aws-elasticloadbalancingv2'
import * as ssm from '@aws-cdk/aws-ssm'
import * as secrets from '@aws-cdk/aws-secretsmanager'

export interface ServiceStackProps extends cdk.StackProps {
  tagOrDigest: string,
  cpu: number,
  memory: number
}

export class ServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // IAM Role
    const executionRole = new iam.Role(this, 'EcsTaskExecutionRole', {
      roleName: 'ecs-task-execution-role',
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
      ],
    })

    const serviceTaskRole = new iam.Role(this, 'EcsServiceTaskRole', {
      roleName: 'ecs-service-task-role',
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    })

    // ECS TaskDefinition
    const logGroup = new logs.LogGroup(this, 'ServiceLogGroup', {
      logGroupName: this.node.tryGetContext('serviceName')
    })

    const image = ecs.ContainerImage.fromRegistry(`${this.node.tryGetContext('repository')}${props.tagOrDigest}`)

    const serviceTaskDefinition = new ecs.FargateTaskDefinition(this, 'ServiceTaskDefinition', {
      family: this.node.tryGetContext('serviceName'),
      cpu: props.cpu,
      memoryLimitMiB: props.memory,
      executionRole: executionRole,
      taskRole: serviceTaskRole,
    })

    serviceTaskDefinition.addContainer('serviceTaskContainerDefinition', {
      image,
      cpu: props.cpu,
      memoryLimitMiB: props.memory,
      memoryReservationMiB: props.memory,
      // secrets: {
      //   'SECRET': ecs.Secret.fromSecretsManager(secrets.Secret.fromSecretArn(this, 'Secrets', 'secret ARN')),
      //   'PARAMETER': ecs.Secret.fromSsmParameter(ssm.StringParameter.fromStringParameterName(this, 'Parameter', 'parameter name')),
      // },
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: this.node.tryGetContext('serviceName'),
        logGroup,
      }),
    }).addPortMappings({
      containerPort: 3000,
      hostPort: 3000,
      protocol: ecs.Protocol.TCP,
    })

    // ECS Service
    const vpc = ec2.Vpc.fromLookup(this, 'vpc', {
      vpcId: this.node.tryGetContext('vpcId')
    })

    const cluster = ecs.Cluster.fromClusterAttributes(this, 'Cluster', {
      clusterName: this.node.tryGetContext('clusterName'),
      vpc: vpc,
      securityGroups: []
    })

    const securityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'ApplicationSecurityGroup', this.node.tryGetContext('securityGroupId'))

    const serviceFargateService = new ecs.FargateService(this, 'ServiceServiceDefinition', {
      serviceName: this.node.tryGetContext('serviceName'),
      cluster,
      vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE }),
      securityGroup,
      taskDefinition: serviceTaskDefinition,
      desiredCount: 2,
      maxHealthyPercent: 200,
      minHealthyPercent: 50,
    })

    const albTargetGroup = alb.ApplicationTargetGroup.fromTargetGroupAttributes(this, 'AlbTargetGroup', {
      targetGroupArn: this.node.tryGetContext('targetGroupArn')
    })

    albTargetGroup.addTarget(serviceFargateService.loadBalancerTarget({
      containerName: serviceTaskDefinition.defaultContainer!.containerName,
      containerPort: serviceTaskDefinition.defaultContainer!.containerPort,
    }))
  }
}
