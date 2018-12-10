'use strict';

import IntegrationConfigFactory from '../IntegrationConfigFactory';
import { IIntegrationConfig, IntegrationType } from '../IIntegrationConfig';
import { mkdir, writeFile } from 'fs';

export default class DataAccessDoc {

    private _integrationType;
    private _queries;
    private _header: string[] = [];
    private _footer: string[] = [];

    constructor(integrationType: string) {
        this._integrationType = integrationType;
        this._header.push(`# Data Access Requirements: ${this._integrationType}`);
        this._header.push('The following tables and fields are required for the DIA with integrationConfig: ' + this._integrationType);
        this._footer.push('');

        const icf = new IntegrationConfigFactory();
        const cfg: IIntegrationConfig = icf.create(this._integrationType);

        this._queries = cfg.queries;
    }

    public create(): void {
        const path = './docs/DataAccess/' + this._integrationType + '.md';
        const data = this._header.join('\n') + '\n\n' + this._createTable().join('\n') + '\n\n' + this._footer.join('\n');
        writeFile(path, data, (err) => {
            if (err) {
                console.log(err);
            }
        });
    }

    private _getQueryInfo(): any {
        return this._queries.map((query) => {
            const tableName = query.name;
            const splitQuery = query.query.replace(/[^ ]*\.\*/gi, '*').replace(/,/g , '').toUpperCase().split(' ');
            const fields = splitQuery.slice(1, splitQuery.indexOf('FROM'));
            return { tableName, fields };
        });
    }

    private _createTable(): string[] {
        const tableHead = [ '| Tables | Fields |' , '| ------ | ------ |' ];
        const queryInfo = this._getQueryInfo();
        const tableBody = [];
        queryInfo.forEach((query) => {
            tableBody.push(`| ${ query.tableName } | ${ query.fields.join(', ') } |`);
        });
        const table = tableHead.concat(tableBody);
        return table;
    }

}
