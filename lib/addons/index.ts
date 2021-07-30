export { AppMeshAddOn } from './appmesh'
export { ArgoCDAddOn } from './argocd'
export { AwsLoadBalancerControllerAddOn} from './aws-loadbalancer-controller'
export { CalicoAddOn } from './calico'
export { ContainerInsightsAddOn } from './container-insights'
export { ClusterAutoScalerAddOn } from './cluster-autoscaler'
export { ExternalDnsAddon } from './external-dns'
export { OpaAddOn } from './OPA'
export { HostedZoneProvider, LookupHostedZoneProvider, DelegatingHostedZoneProvider } from './external-dns/hosted-provider'
export { MetricsServerAddOn } from './metrics-server'
export { NginxAddOn } from './nginx'
export { SSMAgentAddOn } from './ssm-agent'
export { XrayAddOn } from './xray'

export class Constants {
    public static readonly SSP_ADDON = "ssp-addon";
}