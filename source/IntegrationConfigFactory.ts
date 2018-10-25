// tslint:disable:no-string-literal

import TYPES from '../ioc.types';
import { Container, inject, injectable, tagged } from 'inversify';
import 'reflect-metadata';
import * as Winston from 'winston';
import { IIntegrationConfig, IQueryDefinition } from './IIntegrationConfig';
import { IntegrationType } from 'aws-sdk/clients/apigateway';

/**
 * Given an integration type, return a set of integration queries to run
 *
 * @export
 * @class IntegrationConfigFactory
 */
@injectable()
export default class IntegrationConfigFactory {
    private _logger: Winston.Logger;

    /**
     * Creates specifically typed messages given a json string
     * @param {Container} container The IOC container used to resolve other dependencies
     * @memberof MessageHandlerFactory
     */
    constructor(@inject(TYPES.Logger) logger: Winston.Logger) {
        this._logger = logger;
    }

    public create(integrationType: IntegrationType): IIntegrationConfig {
        switch (integrationType) {
            case 'Banner': {
                const BANNER_TEMPLATE_STATEMENTS: IQueryDefinition[] = new Array<IQueryDefinition>();

                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SCBCRKY',
                    query: 'Select * from SCBCRKY'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SCBCRSE',
                    query: 'Select * from SCBCRSE'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SCRATTR',
                    query: 'Select * from SCRATTR'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SCRCORQ',
                    query: 'Select * from SCRCORQ'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SCREQIV',
                    query: 'Select * from SCREQIV'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SCRLEVL',
                    query: 'Select * from SCRLEVL'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SCRRCAM',
                    query: 'Select * from SCRRCAM'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SCRRCLS',
                    query: 'Select * from SCRRCLS'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SCRRCOL',
                    query: 'Select * from SCRRCOL'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SCRRDEG',
                    query: 'Select * from SCRRDEG'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SCRRLVL',
                    query: 'Select * from SCRRLVL'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SCRRMAJ',
                    query: 'Select * from SCRRMAJ'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SCRRPRG',
                    query: 'Select * from SCRRPRG'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SCRRTST',
                    query: 'Select * from SCRRTST'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SCRSCHD',
                    query: 'Select * from SCRSCHD'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SFRSTCR',
                    query: 'select SFRSTCR_PIDM, SFRSTCR_ACTIVITY_DATE, SFRSTCR_CREDIT_HR, SFRSTCR_CRN, SFRSTCR_LEVL_CODE, SFRSTCR_RSTS_CODE, SFRSTCR_TERM_CODE, ROWID from SFRSTCR'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SGRCLSR',
                    query: 'Select * from SGRCLSR'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SGRSATT',
                    query: 'select SGRSATT_PIDM, SGRSATT_ATTS_CODE, SGRSATT_TERM_CODE_EFF, ROWID from SGRSATT'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SHRATTC',
                    query: 'select SHRATTC_TERM_CODE, SHRATTC_CRN, SHRATTC_ATTR_CODE from SHRATTC'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SHRATTR',
                    query: 'select SHRATTR_PIDM, SHRATTR_TERM_CODE, SHRATTR_ATTR_CODE, SHRATTR_TCKN_SEQ_NO from SHRATTR'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SHRDGMR',
                    query: 'select SHRDGMR_PIDM, SHRDGMR_DEGC_CODE, SHRDGMR_DEGS_CODE, SHRDGMR_SEQ_NO, SHRDGMR_TERM_CODE_GRAD from SHRDGMR'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SHRGRDE',
                    query: 'Select SHRGRDE_CODE, SHRGRDE_GPA_IND, SHRGRDE_COMPLETED_IND, SHRGRDE_LEVL_CODE, SHRGRDE_QUALITY_POINTS, SHRGRDE_TERM_CODE_EFFECTIVE, SHRGRDE_ACTIVITY_DATE, SHRGRDE_GRDE_STATUS_IND FROM SHRGRDE'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SHRTATT',
                    query: 'select SHRTATT_PIDM, SHRTATT_TRIT_SEQ_NO, SHRTATT_TRAM_SEQ_NO, SHRTATT_TRCR_SEQ_NO, SHRTATT_TRCE_SEQ_NO, SHRTATT_ATTR_CODE from SHRTATT'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SHRTCKG',
                    query: 'select SHRTCKG_PIDM, SHRTCKG_TERM_CODE, SHRTCKG_TCKN_SEQ_NO, SHRTCKG_SEQ_NO, SHRTCKG_CREDIT_HOURS, SHRTCKG_GRDE_CODE_FINAL, SHRTCKG_ACTIVITY_DATE from SHRTCKG'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SHRTCKL',
                    query: 'select SHRTCKL_PIDM, SHRTCKL_TERM_CODE, SHRTCKL_TCKN_SEQ_NO, SHRTCKL_LEVL_CODE, SHRTCKL_ACTIVITY_DATE, ROWID from SHRTCKL'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SHRTCKN',
                    query: 'select SHRTCKN_PIDM, SHRTCKN_CRN, SHRTCKN_TERM_CODE, SHRTCKN_SEQ_NO, SHRTCKN_SUBJ_CODE, SHRTCKN_CRSE_NUMB, SHRTCKN_REPEAT_COURSE_IND, SHRTCKN_CRSE_TITLE, SHRTCKN_ACTIVITY_DATE from SHRTCKN'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SHRTGPA',
                    query: 'select SHRTGPA_PIDM, SHRTGPA_TERM_CODE, SHRTGPA_HOURS_EARNED, SHRTGPA_GPA_TYPE_IND from SHRTGPA'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SHRTRCE',
                    query: 'select SHRTRCE_PIDM, SHRTRCE_TERM_CODE_EFF, SHRTRCE_GRDE_CODE, SHRTRCE_LEVL_CODE, SHRTRCE_SUBJ_CODE,SHRTRCE_CRSE_NUMB, SHRTRCE_CREDIT_HOURS, SHRTRCE_REPEAT_COURSE, SHRTRCE_CRSE_TITLE, SHRTRCE_TRIT_SEQ_NO, SHRTRCE_TRAM_SEQ_NO, SHRTRCE_SEQ_NO, SHRTRCE_ACTIVITY_DATE, ROWID from SHRTRCE '
                });

                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SIRASGN',
                    query: 'Select * from SIRASGN'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SLBBLDG',
                    query: 'Select * from SLBBLDG'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SLBRDEF',
                    query: 'Select * from SLBRDEF'
                });

                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRPRLE',
                    query: 'Select * from SMRPRLE'
                });

                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SOBPTRM',
                    query: 'Select * from SOBPTRM'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SPRIDEN',
                    query: 'select * from SPRIDEN'
                });
                
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SSBSECT',
                    query: 'select * From SSBSECT'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SSBXLST',
                    query: 'Select * from SSBXLST'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SSRMEET',
                    query: 'Select * from SSRMEET'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SSRXLST',
                    query: 'Select * from SSRXLST'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVATTR',
                    query: 'Select * from STVATTR'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVATTS',
                    query: 'Select * from STVATTS'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVBLDG',
                    query: 'Select * from STVBLDG'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVCAMP',
                    query: 'Select * from STVCAMP'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVCLAS',
                    query: 'Select * from STVCLAS'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVCOLL',
                    query: 'select STVCOLL_CODE, STVCOLL_DESC from STVCOLL'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVCSTA',
                    query: 'Select * from STVCSTA'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVDEGC',
                    query: 'Select * from STVDEGC'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVDEGS',
                    query: 'select STVDEGS_CODE, STVDEGS_AWARD_STATUS_IND from STVDEGS'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVDEPT',
                    query: 'Select * from STVDEPT'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVDIVS',
                    query: 'Select * from STVDIVS'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVLEVL',
                    query: 'Select * from STVLEVL'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVMAJR',
                    query: 'Select STVMAJR_CODE, STVMAJR_DESC, STVMAJR_CIPC_CODE, STVMAJR_VALID_MAJOR_IND, STVMAJR_VALID_MINOR_IND, STVMAJR_VALID_CONCENTRATN_IND, STVMAJR_ACTIVITY_DATE, STVMAJR_OCCUPATION_IND, STVMAJR_AID_ELIGIBILITY_IND, STVMAJR_SYSTEM_REQ_IND, STVMAJR_VR_MSG_NO, STVMAJR_SEVIS_EQUIV, STVMAJR_SURROGATE_ID, STVMAJR_VERSION, STVMAJR_USER_ID, STVMAJR_DATA_ORIGIN, STVMAJR_VPDI_CODE from STVMAJR'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVRESD',
                    query: 'Select STVRESD_CODE, STVRESD_DESC, STVRESD_IN_STATE_IND, STVRESD_ACTIVITY_DATE, STVRESD_SYSTEM_REQ_IND, STVRESD_VR_MSG_NO, STVRESD_EDI_EQUIV, STVRESD_SURROGATE_ID, STVRESD_VERSION, STVRESD_USER_ID, STVRESD_DATA_ORIGIN, STVRESD_VPDI_CODE from STVRESD'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVRSTS',
                    query: 'select STVRSTS_CODE, STVRSTS_INCL_ASSESS, STVRSTS_ACTIVITY_DATE from STVRSTS'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVSCHD',
                    query: 'Select * from STVSCHD'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVSTST',
                    query: 'Select * from STVSTST'
                });

                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVSUBJ',
                    query: 'Select * from STVSUBJ'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVTERM',
                    query: 'Select * from STVTERM'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVPTRM',
                    query: 'Select * from STVPTRM'
                });

                //Consider using: DBMS_METADATA.GET_DDL('TABLE','<tableName>','SATURN') FROM DUAL' for DDL information

                return {
                    queries: BANNER_TEMPLATE_STATEMENTS,
                    type: 'Banner'
                };
            }
            case 'Demo': {
                const DEMO_TEMPLATE_STATEMENTS: IQueryDefinition[] = new Array<IQueryDefinition>();

                DEMO_TEMPLATE_STATEMENTS.push({
                    name: 'all_tables',
                    query: 'SELECT * FROM ALL_TABLES'
                });
                return {
                    queries: DEMO_TEMPLATE_STATEMENTS,
                    type: 'Demo'
                };
            }
            default: {
                throw Error('Unsupported integration type in IntegrationConfigFactory');
            }
        }
    }
}
