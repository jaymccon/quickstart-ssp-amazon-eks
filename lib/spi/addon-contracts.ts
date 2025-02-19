import { Team, ClusterInfo } from '.';

/**
 * ClusterAddOn is the interface to which all Cluster addons should conform.
 */
export declare interface ClusterAddOn {
    deploy(clusterInfo: ClusterInfo): void;
}

/**
 * Optional interface to allow cluster bootstrapping after provisioning of add-ons and teams is complete.
 * Can be leveraged to bootstrap workloads, perform cluster checks. 
 * ClusterAddOn implementation may implement this interface in order to get post deployment hook point.
 */
export declare interface ClusterPostDeploy {
    postDeploy(clusterInfo: ClusterInfo, teams: Team[]): void;
}
