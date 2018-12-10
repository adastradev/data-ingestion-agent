'use strict'

import IntegrationConfigFactory from '../IntegrationConfigFactory';
import { IIntegrationConfig, IntegrationType } from '../IIntegrationConfig';
import { writeFile } from 'fs';
import IDataAccessDoc from './IDataAccessDoc';

let integrationTypes = [
    IntegrationType.Banner,
    IntegrationType.DegreeWorks
]

class DataAccessDoc implements IDataAccessDoc {
    
    integrationType;
    queries;
    header;
    footer;

    constructor(integrationType: string) {
        this.integrationType = integrationType;
        this.header.push('HEADER');
        this.footer.push('FOOTER');
        
        let icf = new IntegrationConfigFactory();
        let cfg: IIntegrationConfig = icf.create(this.integrationType);

        this.queries = cfg.queries;
    }

    getQueryInfo() { return null };
    createTable() { return [""] }
    create() { };
    
}