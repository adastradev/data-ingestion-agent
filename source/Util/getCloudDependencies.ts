import * as path from 'path';

export default function getCloudDependencies(): Map<any, any> {
    const pkgPath = path.resolve('package.json');
    return new Map(Object.entries(require(pkgPath).cloudDependencies));
}
