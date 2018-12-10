'use strict'

import IntegrationConfigFactory from '../IntegrationConfigFactory';
import { IIntegrationConfig, IntegrationType } from '../IIntegrationConfig';
import { writeFile, mkdir } from 'fs';
import IDataAccessDoc from './IDataAccessDoc';

let integrationEnumKeys = Object.keys(IntegrationType).slice(0, -2)
let integrationTypes = integrationEnumKeys.map(key => {
    return IntegrationType[key];
})

class DataAccessDoc implements IDataAccessDoc {
    
    integrationType;
    queries;
    header: string[] = [];
    footer: string[] = [];

    constructor(integrationType: string) {
        this.integrationType = integrationType;
        this.header.push(`# Data Access Requirements: ${this.integrationType}`);
        this.header.push('The following tables and fields are required for the DIA with integrationConfig: ' + this.integrationType);
        this.footer.push('');
        
        let icf = new IntegrationConfigFactory();
        let cfg: IIntegrationConfig = icf.create(this.integrationType);

        this.queries = cfg.queries;
    }

    getQueryInfo(): any {
        return this.queries.map(query => {
            let tableName = query.name;
            let splitQuery = query.query.replace(/,/g , '').toUpperCase().split(' ');
            let fields = splitQuery.slice(1, splitQuery.indexOf('FROM'));
            return { tableName, fields };
        });
    }

    createTable(): string[] {
        let tableHead = [ '| Tables | Fields |' , '| ------ | ------ |' ];
        let queryInfo = this.getQueryInfo();
        let tableBody = [];
        queryInfo.forEach(query => {
            tableBody.push(`| ${ query.tableName } | ${ query.fields.join(', ') } |`)
        });
        let table = tableHead.concat(tableBody);
        return table;
    }

    create(): void {
        let path = './docs/DataAccess/' + this.integrationType + '.md';
        let data = this.header.join('  ') + '  ' + this.createTable().join('  ') + '  ' + this.footer.join('  ');
        writeFile(path, data, (err) => {
            if (err) { 
                console.log(err);
            };
        });
    }

}

integrationTypes.forEach(type => {
    let DAD = new DataAccessDoc(type);
    DAD.create();
});