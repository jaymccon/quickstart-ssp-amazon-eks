import { ManagedPolicy } from "@aws-cdk/aws-iam";
import { assertEC2NodeGroup } from "../../cluster-providers";

import { ClusterAddOn, ClusterInfo } from "../../spi";

export interface AppMeshAddOnProps {
    /**
     * If set to true, will enable tracing through App Mesh sidecars, such as X-Ray distributed tracing.
     * Note: support for X-Ray tracing does not depend on the XRay Daemon AddOn installed.
     */
    enableTracing?: boolean,

    /**
     * Tracing provider. Supported values are x-ray, jaeger, datadog
     */
    tracingProvider?: "x-ray" | "jaeger" | "datadog"

    /**
     * Used for Datadog or Jaeger tracing. Example values: datadog.appmesh-system. Refer to https://aws.github.io/aws-app-mesh-controller-for-k8s/guide/tracing/ for more information.
     * Ignored for X-Ray.
     */
    tracingAddress?: string,

    /**
     * Jaeger or Datadog agent port (ignored for X-Ray)
     */
    tracingPort?: string
}

const appMeshAddonDefaults : AppMeshAddOnProps = {
    enableTracing: false,
    tracingProvider: "x-ray"
}

export class AppMeshAddOn implements ClusterAddOn {

    readonly appMeshOptions : AppMeshAddOnProps;

    constructor(appMeshProps?: AppMeshAddOnProps) {
        this.appMeshOptions = { ...appMeshAddonDefaults, ...appMeshProps };
    }


    deploy(clusterInfo: ClusterInfo): void {

        const cluster = clusterInfo.cluster;

        // App Mesh service account.
        const opts = { name: 'appmesh-controller', namespace: "appmesh-system" }
        const sa = cluster.addServiceAccount('appmesh-controller', opts);

        // Cloud Map Full Access policy.
        const cloudMapPolicy = ManagedPolicy.fromAwsManagedPolicyName("AWSCloudMapFullAccess");
        sa.role.addManagedPolicy(cloudMapPolicy);

        // App Mesh Full Access policy.
        const appMeshPolicy = ManagedPolicy.fromAwsManagedPolicyName("AWSAppMeshFullAccess");
        sa.role.addManagedPolicy(appMeshPolicy);

        if(this.appMeshOptions.enableTracing && this.appMeshOptions.tracingProvider === "x-ray") {
            const xrayPolicy = ManagedPolicy.fromAwsManagedPolicyName("AWSXRayDaemonWriteAccess");
            const ng = assertEC2NodeGroup(clusterInfo, "App Mesh X-Ray integration");
            ng.role.addManagedPolicy(xrayPolicy);
        }
      
        // App Mesh Namespace
        const appMeshNS = cluster.addManifest('appmesh-ns', {
            apiVersion: 'v1',
            kind: 'Namespace',
            metadata: { name: 'appmesh-system' }
        });
        sa.node.addDependency(appMeshNS);

        // App Mesh Controller        
        const chart = cluster.addHelmChart("appmesh-addon", {
            chart: "appmesh-controller",
            repository: "https://aws.github.io/eks-charts",
            release: "appm-release",
            namespace: "appmesh-system",
            values: {
                region: cluster.stack.region,
                serviceAccount: { 
                   create: false,
                   'name': 'appmesh-controller'
                },
                tracing: {
                    enabled: this.appMeshOptions.enableTracing,
                    provider: this.appMeshOptions.tracingProvider,
                    address: this.appMeshOptions.tracingAddress,
                    port: this.appMeshOptions.tracingPort
                }
            }
        });

        chart.node.addDependency(sa);
    }
}