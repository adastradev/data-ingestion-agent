'use strict';

import IntegrationConfigFactory from '../IntegrationConfigFactory';
import { IIntegrationConfig, IntegrationType } from '../IIntegrationConfig';
import { writeFile } from 'fs';

export default class DataAccessDocGenerator {

    private _integrationType;
    private _queries;
    private _header: string[] = [];
    private _footer: string[] = [];

    constructor(integrationType: IntegrationType) {
        this._integrationType = integrationType.toString();
        const icf = new IntegrationConfigFactory();
        const cfg: IIntegrationConfig = icf.create(this._integrationType);
        this._queries = cfg.queries;
    }

    public async create() {
        const path = './docs/DataAccess/' + this._integrationType + '.md';
        const newLine = '\n';
        this._header.push(`# Data Access Requirements: ${this._integrationType}`);
        this._header.push(`DIA requires access to the following tables/fields in the ${this._integrationType} integration type.`);
        const data = this._header.join(newLine) + newLine.repeat(2) + this._createMarkdownTable().join(newLine) + newLine.repeat(2) + this._footer.join(newLine);
        await writeFile(path, data, (err) => {
            if (err) {
                console.log(err);
            }
        });
        return;
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

    private _createMarkdownTable(): string[] {
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
