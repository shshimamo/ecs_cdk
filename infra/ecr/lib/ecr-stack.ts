import * as cdk from '@aws-cdk/core';
import * as ecr from '@aws-cdk/aws-ecr';

export class EcrStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repository_front = new ecr.Repository(this, 'FrontRepository', {
      repositoryName: 'ecs_cdk-frontend-repository'
    });
    const repository_back = new ecr.Repository(this, 'BackRepository', {
      repositoryName: 'ecs_cdk-backend-repository'
    });
  }
}
