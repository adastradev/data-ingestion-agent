export default function getCloudDependencies(): Map<any, any> {
    return new Map(Object.entries(require('package.json').cloudDependencies));
}
