'use strict';

import IntegrationConfigFactory from '../IntegrationConfigFactory';
import { IIntegrationConfig, IntegrationType } from '../IIntegrationConfig';
import { writeFile } from 'fs';

export default class DataAccessDoc {

    private _integrationType;
    private _queries;
    private _header: string[] = [];
    private _footer: string[] = [];

    constructor(integrationType: IntegrationType) {
        this._integrationType = integrationType.toString();
        const icf = new IntegrationConfigFactory();
        const cfg: IIntegrationConfig = icf.create(this._integrationType);
        this._queries = cfg.queries;
        this._header.push(`# Data Access Requirements: ${this._integrationType}`);
        this._header.push(`DIA requires access to the following tables/fields in the ${this._integrationType} integration type.`);
    }

    public create(): void {
        const path = './docs/DataAccess/' + this._integrationType + '.md';
        const n = '\n';
        const dn = n + n;
        const data = this._header.join(n) + dn + this._createTable().join(n) + dn + this._footer.join(n);
        writeFile(path, data, (err) => {
            if (err) {
                console.log(err);
            }
        });
    }

    private _getQueryInfo(): any {
        return this._queries.map((query) => {
            const tableName = query.name;
            // First regex turns 'X.*' instances into '*', second regex removes all commas
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
