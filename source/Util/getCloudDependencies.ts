import * as path from 'path';

export default function getCloudDependencies(): Map<any, any> {
    const pkgPath = path.resolve('package.json');
    // tslint:disable:tsr-detect-non-literal-require
    return new Map(Object.entries(require(pkgPath).cloudDependencies));
}
