import { IntegrationType } from '../IIntegrationConfig';
import DataAccessDocGenerator from '../DataAccess/DataAccessDocGenerator';

const integrationEnumKeys = Object.keys(IntegrationType).slice(0, -2);
const integrationTypes = integrationEnumKeys.map((key) => {
    return IntegrationType[key];
});

// Create DataAccessDocs

integrationTypes.forEach((type) => {
    const DAD = new DataAccessDocGenerator(type);
    DAD.create();
});
