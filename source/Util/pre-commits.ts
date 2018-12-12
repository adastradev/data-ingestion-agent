import { IntegrationType } from '../IIntegrationConfig';
import DataAccessDoc from '../DataAccess/DataAccessDocGenerator';

const integrationEnumKeys = Object.keys(IntegrationType).slice(0, -2);
const integrationTypes = integrationEnumKeys.map((key) => {
    return IntegrationType[key];
});

// Create DataAccessDocs

integrationTypes.forEach((type) => {
    const DAD = new DataAccessDoc(type);
    DAD.create();
});
