import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecr from '@aws-cdk/aws-ecr';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecs_patterns from '@aws-cdk/aws-ecs-patterns';
import * as cdk from '@aws-cdk/core';

export class VpcStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'FrontBackVpc', { maxAzs: 2 });
    const clusterFront = new ecs.Cluster(this, 'FrontCluster', { vpc });
    const clusterBack = new ecs.Cluster(this, 'BackCluster', { vpc });

    // 事前にecr-stack.tsで作成してpushしておく
    const repositoryFront = ecr.Repository.fromRepositoryName(
      this,
      'FrontRepository',
      'ecs_cdk-frontend-repository'
    )
    const repositoryBack = ecr.Repository.fromRepositoryName(
      this,
      'BackRepository',
      'ecs_cdk-backend-repository'
    )

    const frontService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "FrontFargateService", {
      cluster: clusterFront,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(repositoryFront),
        containerPort: 3000
      }
    });

    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "BackFargateService", {
      cluster: clusterBack,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(repositoryBack)
      },
    });
  }
}
