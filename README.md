# Order Management Backend Solution

## Overview of system

The solution contains 2 microservices, Orders-App-Service and Payments-App-Service, written in NestJS. The applications along with a Postgresql database are running in individual pods in a Kubernetes cluster in GKE. The relevant docker images are in Google Container Registry.

### Orders-App-Service

[Source Code](./orders-app-service)

- Accesible publicly at: http://34.121.51.84/orders
- API with 3 endpoints to meet requirements.
   1. Create Order - POST - http://34.121.51.84/orders
   2. Cancel Order - PATCH - http://34.121.51.84/orders/{orderId}/cancel
   3. Get Order status - GET - http://34.121.51.84/orders/{orderId}/status
- Uses Postgresql database. Repository design pattern implemented together with TypeORM integration.
- Helm chart for Kubernetes package management. The Postgresql database is packaged as a dependency chart of the parent chart for coherent deployment.
- Exposed as LoadBalancer Kubernetes service type for external consumption from outside of Kubernetes cluster.

### Payments-App-Service
[Source Code](./payments-app-service)

- API with single endpoint to accept mocked payment request.
- Helm chart for Kubernetes package management. No dependencies.
- Not exposed externally from cluster.


### Infrastructure provisioning
[Source Code](./operations)

GCP has been chosen as cloud provider for this project. Terraform templates configured for infrastructure as code management. 

## Instructions

Prerequisites:
- Google Cloud SDK (As GCP is chosen provider for Terraform templates)
- Terraform
- Kubernetes client
- Helm 3

Clone the repository and perform the following steps.

1 - Set up authentication with GCP

```
gcloud init

gcloud auth application-default login
```


2 - Change directory to `/operations` and update Terraform variables with your GCP project ID. Then run the following

```
terraform init

terraform plan

terraform apply
```

3 - Once infrastructure provisioning is complete, set up credentials for Kubernetes client to communicate with GKE.

```
gcloud container clusters get-credentials CLUSTER NAME --zone ZONE --project PROJECT_ID
```

4 - Change directory to `/orders-app-service` and run Helm install
```
helm install NAME ./orders-app-service
```

5 - Change directory to `/payments-app-service` and run Helm install
```
helm install NAME ./payments-app-service
```

6 - Once deployment is complete, get the load balancer external IP of orders-app-service to test out requests

```
kubectl get svc
```

