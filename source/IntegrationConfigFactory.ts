// tslint:disable:no-string-literal

import TYPES from '../ioc.types';
import { inject, injectable, named } from 'inversify';
import 'reflect-metadata';
import { IIntegrationConfig, IntegrationSystemType, IntegrationType, IQueryDefinition  } from './IIntegrationConfig';

/**
 * Given an integration type, return a set of integration queries to run
 *
 * @export
 * @class IntegrationConfigFactory
 */
@injectable()
export default class IntegrationConfigFactory {
    /**
     * Creates specifically typed messages given a json string
     * @param {Container} container The IOC container used to resolve other dependencies
     * @memberof MessageHandlerFactory
     */
    constructor() {
    }

    public create(integrationType: IntegrationType): IIntegrationConfig {
        switch (integrationType) {
            case IntegrationType.Banner: {
                const BANNER_TEMPLATE_STATEMENTS: IQueryDefinition[] = new Array<IQueryDefinition>();

                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SORCONT',
                    query: 'Select * from SORCONT'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVTMST',
                    query: 'Select * from STVTMST'
                });
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
                    name: 'SCRRARE',
                    query: 'Select * from SCRRARE'
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
                    query: 'select SFRSTCR_PIDM, SFRSTCR_ACTIVITY_DATE, SFRSTCR_CREDIT_HR, SFRSTCR_CRN, '
                    + 'SFRSTCR_LEVL_CODE, SFRSTCR_RSTS_CODE, SFRSTCR_TERM_CODE, ROWID from SFRSTCR'
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
                    query: 'select SHRDGMR_PIDM, SHRDGMR_DEGC_CODE, SHRDGMR_DEGS_CODE, SHRDGMR_SEQ_NO, '
                    + 'SHRDGMR_TERM_CODE_GRAD from SHRDGMR'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SHRGRDE',
                    query: 'Select SHRGRDE_CODE, SHRGRDE_GPA_IND, SHRGRDE_COMPLETED_IND, SHRGRDE_LEVL_CODE, '
                    + 'SHRGRDE_QUALITY_POINTS, SHRGRDE_TERM_CODE_EFFECTIVE, SHRGRDE_ACTIVITY_DATE, '
                    + 'SHRGRDE_GRDE_STATUS_IND FROM SHRGRDE'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SHRTATT',
                    query: 'select SHRTATT_PIDM, SHRTATT_TRIT_SEQ_NO, SHRTATT_TRAM_SEQ_NO, SHRTATT_TRCR_SEQ_NO, '
                    + 'SHRTATT_TRCE_SEQ_NO, SHRTATT_ATTR_CODE from SHRTATT'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SHRTCKG',
                    query: 'select SHRTCKG_PIDM, SHRTCKG_TERM_CODE, SHRTCKG_TCKN_SEQ_NO, SHRTCKG_SEQ_NO, '
                    + 'SHRTCKG_CREDIT_HOURS, SHRTCKG_GRDE_CODE_FINAL, SHRTCKG_ACTIVITY_DATE from SHRTCKG'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SHRTCKL',
                    query: 'select SHRTCKL_PIDM, SHRTCKL_TERM_CODE, SHRTCKL_TCKN_SEQ_NO, SHRTCKL_LEVL_CODE, '
                    + 'SHRTCKL_ACTIVITY_DATE, ROWID from SHRTCKL'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SHRTCKN',
                    query: 'select SHRTCKN_PIDM, SHRTCKN_CRN, SHRTCKN_TERM_CODE, SHRTCKN_SEQ_NO, SHRTCKN_SUBJ_CODE, '
                    + 'SHRTCKN_CRSE_NUMB, SHRTCKN_REPEAT_COURSE_IND, SHRTCKN_CRSE_TITLE, '
                    + 'SHRTCKN_ACTIVITY_DATE from SHRTCKN'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SHRTGPA',
                    query: 'select SHRTGPA_PIDM, SHRTGPA_TERM_CODE, SHRTGPA_HOURS_EARNED, SHRTGPA_GPA_TYPE_IND '
                    + 'from SHRTGPA'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SHRTRCE',
                    query: 'select SHRTRCE_PIDM, SHRTRCE_TERM_CODE_EFF, SHRTRCE_GRDE_CODE, SHRTRCE_LEVL_CODE, '
                    + 'SHRTRCE_SUBJ_CODE,SHRTRCE_CRSE_NUMB, SHRTRCE_CREDIT_HOURS, SHRTRCE_REPEAT_COURSE, '
                    + 'SHRTRCE_CRSE_TITLE, SHRTRCE_TRIT_SEQ_NO, SHRTRCE_TRAM_SEQ_NO, SHRTRCE_SEQ_NO, '
                    + 'SHRTRCE_ACTIVITY_DATE, ROWID from SHRTRCE'
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
                    name: 'SMBAGEN',
                    query: 'Select * from SMBAGEN'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMBARUL',
                    query: 'Select * from SMBARUL'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMBGGEN',
                    query: 'Select * from SMBGGEN'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMBGRUL',
                    query: 'Select * from SMBGRUL'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMBPGEN',
                    query: 'Select * from SMBPGEN'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMBSAGN',
                    query: 'Select * from SMBSAGN'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMBSARU',
                    query: 'Select * from SMBSARU'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMBSGGN',
                    query: 'Select * from SMBSGGN'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMBSGRU',
                    query: 'Select * from SMBSGRU'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMBSLIB',
                    query: 'Select * from SMBSLIB'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMBSPGN',
                    query: 'Select * from SMBSPGN'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRACAA',
                    query: 'Select * from SMRACAA'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRACCM',
                    query: 'Select * from SMRACCM'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRACMT',
                    query: 'Select * from SMRACMT'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRAEXL',
                    query: 'Select * from SMRAEXL'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRAGAM',
                    query: 'Select * from SMRAGAM'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRALIB',
                    query: 'Select * from SMRALIB'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRAQUA',
                    query: 'Select * from SMRAQUA'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRAREX',
                    query: 'Select * from SMRAREX'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRARSA',
                    query: 'Select * from SMRARSA'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRARUL',
                    query: 'Select * from SMRARUL'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRGCAA',
                    query: 'Select * from SMRGCAA'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRGCCM',
                    query: 'Select * from SMRGCCM'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRGCMT',
                    query: 'Select * from SMRGCMT'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRGEXL',
                    query: 'Select * from SMRGEXL'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRGLIB',
                    query: 'Select * from SMRGLIB'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRGRCM',
                    query: 'Select * from SMRGRCM'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRGREX',
                    query: 'Select * from SMRGREX'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRGRSA',
                    query: 'Select * from SMRGRSA'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRGRUL',
                    query: 'Select * from SMRGRUL'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRIEAT',
                    query: 'Select * from SMRIEAT'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRIECC',
                    query: 'Select * from SMRIECC'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRIECO',
                    query: 'Select * from SMRIECO'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRIECP',
                    query: 'Select * from SMRIECP'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRIEDG',
                    query: 'Select * from SMRIEDG'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRIEDP',
                    query: 'Select * from SMRIEDP'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRIEMJ',
                    query: 'Select * from SMRIEMJ'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRIEMN',
                    query: 'Select * from SMRIEMN'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRPAAP',
                    query: 'Select * from SMRPAAP'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRPRLE',
                    query: 'Select * from SMRPRLE'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRPRSA',
                    query: 'Select * from SMRPRSA'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRSACA',
                    query: 'Select * from SMRSACA'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRSACE',
                    query: 'Select * from SMRSACE'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRSACM',
                    query: 'Select * from SMRSACM'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRSACT',
                    query: 'Select * from SMRSACT'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRSAGM',
                    query: 'Select * from SMRSAGM'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRSARE',
                    query: 'Select * from SMRSARE'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRSARS',
                    query: 'Select * from SMRSARS'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRSARU',
                    query: 'Select * from SMRSARU'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRSGAV',
                    query: 'Select * from SMRSGAV'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRSGCA',
                    query: 'Select * from SMRSGCA'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRSGCE',
                    query: 'Select * from SMRSGCE'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRSGCM',
                    query: 'Select * from SMRSGCM'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRSGCT',
                    query: 'Select * from SMRSGCT'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRSGRE',
                    query: 'Select * from SMRSGRE'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRSGRS',
                    query: 'Select * from SMRSGRS'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRSGRU',
                    query: 'Select * from SMRSGRU'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRSPRS',
                    query: 'Select * from SMRSPRS'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRSSUB',
                    query: 'Select * from SMRSSUB'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRSTRG',
                    query: 'Select * from SMRSTRG'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SMRSWAV',
                    query: 'Select * from SMRSWAV'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SOBPTRM',
                    query: 'Select * from SOBPTRM'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SPRIDEN',
                    query: 'select * from SPRIDEN s where SPRIDEN_CHANGE_IND IS NULL'
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
                    query: 'Select STVMAJR_CODE, STVMAJR_DESC, STVMAJR_CIPC_CODE, STVMAJR_VALID_MAJOR_IND, '
                    + 'STVMAJR_VALID_MINOR_IND, STVMAJR_VALID_CONCENTRATN_IND, STVMAJR_ACTIVITY_DATE, '
                    + 'STVMAJR_OCCUPATION_IND, STVMAJR_AID_ELIGIBILITY_IND, STVMAJR_SYSTEM_REQ_IND, '
                    + 'STVMAJR_VR_MSG_NO, STVMAJR_SEVIS_EQUIV, STVMAJR_SURROGATE_ID, STVMAJR_VERSION, STVMAJR_USER_ID, '
                    + 'STVMAJR_DATA_ORIGIN, STVMAJR_VPDI_CODE from STVMAJR'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVRESD',
                    query: 'Select STVRESD_CODE, STVRESD_DESC, STVRESD_IN_STATE_IND, STVRESD_ACTIVITY_DATE, '
                    + 'STVRESD_SYSTEM_REQ_IND, STVRESD_VR_MSG_NO, STVRESD_EDI_EQUIV, STVRESD_SURROGATE_ID, '
                    + 'STVRESD_VERSION, STVRESD_USER_ID, STVRESD_DATA_ORIGIN, STVRESD_VPDI_CODE from STVRESD'
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
                    name: 'STVSTYP',
                    query: 'Select * from STVSTYP'
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
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SORTEST',
                    query: 'Select * from SORTEST'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'SGBSTDN',
                    query: 'Select * from SGBSTDN'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVSESS',
                    query: 'Select * from STVSESS'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'STVSSTS',
                    query: 'Select * from STVSSTS'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'GTVMTYP',
                    query: 'Select * from GTVMTYP'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'GTVINSM',
                    query: 'Select * from GTVINSM'
                });
                BANNER_TEMPLATE_STATEMENTS.push({
                    name: 'GOREMAL',
                    query: 'Select * from GOREMAL'
                });

                return {
                    queries: BANNER_TEMPLATE_STATEMENTS,
                    type: integrationType
                };
            }
            case IntegrationType.DegreeWorks: {
                const DW_TEMPLATE_STATEMENTS: IQueryDefinition[] = new Array<IQueryDefinition>();

                DW_TEMPLATE_STATEMENTS.push({
                    name: 'DAP_RESULT_DTL',
                    query: 'SELECT DAP_STU_ID, DAP_AUDIT_TYPE, DAP_DEGREE, DAP_BLOCK_SEQ_NUM, '
                        + 'DAP_RESULT_SEQ_NUM, DAP_REQ_ID, DAP_RULE_ID, DAP_RESULT_TYPE, '
                        + 'DAP_VALUE1, DAP_SCHOOL, DAP_VALUE2, DAP_VALUE3, DAP_VALUE4, '
                        + 'DAP_FREETEXT, DAP_CREATE_DATE, Unique_ID, DAP_NODE_TYPE '
                    + 'FROM DAP_RESULT_DTL'
                });

                DW_TEMPLATE_STATEMENTS.push({
                    name: 'CPA_CLASSNEEDED',
                    query: 'SELECT STU_ID, REQ_ID, RULE_ID, RESULT_TYPE, WITH_ADVICE, RESULT_SEQ_NUM '
                    + 'FROM CPA_CLASSNEEDED'
                });

                return {
                    queries: DW_TEMPLATE_STATEMENTS,
                    type: integrationType
                };
            }
            case IntegrationType.PeopleSoft: {
                const PEOPLESOFT_TEMPLATE_STATEMENTS: IQueryDefinition[] = new Array<IQueryDefinition>();

                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_AA_OVERRIDE',
                    query: 'SELECT DESCR254A, ACAD_SUB_PLAN, ACAD_PLAN, ACAD_PROG, ACAD_CAREER, INSTITUTION, OPRID, RQ_AA_OVRD_OPLEVEL, RQ_AA_OVRD_OPCODE, '
                        + 'RQ_AA_WHO_DATA, RQ_AA_WHO_CODE, DESCRSHORT, DESCR, EFF_STATUS, EFFDT,RQ_AA_OVERRIDE, ROWID '
                        + 'FROM PS_AA_OVERRIDE'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_AA_OVRD_CRSDATA',
                    query: 'SELECT RQ_AA_OVERRIDE, RQ_AA_OVRD_LN_NBR, RQ_AA_OVRD_CRS_NBR, RQ_CRSE_SOURCE, CRSE_ID, EFFDT, CRSE_OFFER_NBR, STRM, CLASS_NBR, SUBJECT, CATALOG_NBR, '
                        + 'SESSION_CODE, CLASS_SECTION, CRS_TOPIC_ID, CRSES_DIRECTED, UNITS_DIRECTED, DIRCT_TYPE, GRADE_POINTS_MIN, ACAD_GROUP, TRNSFR_EQVLNCY_GRP, TRNSFR_EQVLNCY_SEQ, '
                        + 'MODEL_NBR, CRSE_GRADE_OFF, UNT_EARNED, RQMNT_DESIGNTN, RQMNT_DESIGNTN_GRD, RQMNT_DESIGNTN_OPT, ROWID '
                        + 'FROM PS_AA_OVRD_CRSDATA'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_AA_OVRD_DATA',
                    query: 'SELECT * FROM PS_AA_OVRD_DATA'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_AA_OVRD_WHERE',
                    query: 'SELECT * FROM PS_AA_OVRD_WHERE'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_CRSE_ATTRIBUTES',
                    query: 'SELECT * FROM PS_CRSE_ATTRIBUTES'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_CRSE_ATTR_TBL',
                    query: 'SELECT * FROM PS_CRSE_ATTR_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_ACAD_DEGR',
                    query: 'SELECT * FROM PS_ACAD_DEGR'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_ACAD_GROUP_TBL',
                    query: 'SELECT * FROM PS_ACAD_GROUP_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_ACAD_LEVEL_TBL',
                    query: 'SELECT * FROM PS_ACAD_LEVEL_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_ACAD_ORG_TBL',
                    query: 'SELECT * FROM PS_ACAD_ORG_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_ACAD_PLAN',
                    query: 'SELECT EMPLID, ACAD_PLAN, STDNT_CAR_NBR, ACAD_CAREER, EFFSEQ, EFFDT '
                        + 'FROM PS_ACAD_PLAN'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_ACAD_PLAN_TBL',
                    query: 'SELECT * FROM PS_ACAD_PLAN_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_ACAD_PROG',
                    query: 'SELECT EMPLID, ACAD_CAREER, ACAD_PROG, DEGR_CHKOUT_STAT, STDNT_CAR_NBR, REQ_TERM, EFFDT, EFFSEQ, INSTITUTION '
                        + 'FROM PS_ACAD_PROG'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_ACAD_PROG_TBL',
                    query: 'SELECT * FROM PS_ACAD_PROG_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_ACAD_SUBPLAN',
                    query: 'SELECT EMPLID, ACAD_PLAN, ACAD_SUB_PLAN, STDNT_CAR_NBR, ACAD_CAREER, EFFDT, EFFSEQ '
                        + 'FROM PS_ACAD_SUBPLAN'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_ACAD_SUBPLN_TBL',
                    query: 'SELECT * FROM PS_ACAD_SUBPLN_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_CAMPUS_EVENT',
                    query: 'SELECT * FROM PS_CAMPUS_EVENT'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_CAMPUS_EVNT_LNG',
                    query: 'SELECT * FROM PS_CAMPUS_EVNT_LNG'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_CAMPUS_LOC_TBL',
                    query: 'SELECT * FROM PS_CAMPUS_LOC_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_CAMPUS_MTG',
                    query: 'SELECT * FROM PS_CAMPUS_MTG'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_CAMPUS_TBL',
                    query: 'SELECT * FROM PS_CAMPUS_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_CLASS_INSTR',
                    query: 'SELECT * FROM PS_CLASS_INSTR'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_CLASS_MTG_PAT',
                    query: 'SELECT * FROM PS_CLASS_MTG_PAT'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_CLASS_TBL',
                    query: 'SELECT * FROM PS_CLASS_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_CLST_DETL_TBL',
                    query: 'Select COURSE_LIST, EFFDT, R_COURSE_SEQUENCE, WILDCARD_IND, CRSVALID_BEGIN, CRSVALID_END, TRNSFR_LVL_ALLOWD, TEST_CRDT_ALLOWD, OTHR_CRDT_ALLOWD, INCL_GPA_REQ, '
                        + 'EXCL_IP_CREDIT, GRADE_POINTS_MIN, UNITS_MINIMUM, INSTITUTION, ACAD_GROUP, SUBJECT, CATALOG_NBR, WILD_PATTERN_TYPE, CRSE_ID, INCLUDE_EQUIVALENT, STRM, '
                        + 'ASSOCIATED_CLASS, CRS_TOPIC_ID, RQMNT_DESIGNTN, SAA_DSP_WILD_CRSES, DESCR, SAA_DESCR254 '
                        + 'FROM PS_CLST_DETL_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_CLST_MAIN_TBL',
                    query: 'Select COURSE_LIST, EFFDT, EFF_STATUS, DESCR, DESCRSHORT, RQRMNT_USEAGE, INSTITUTION, ACAD_CAREER, ACAD_GROUP, ACAD_PROG, ACAD_PLAN, '
                        + 'ACAD_SUB_PLAN, SUBJECT, CATALOG_NBR, DESCR254A '
                        + 'FROM PS_CLST_MAIN_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_CRSE_CATALOG',
                    query: 'SELECT EFF_STATUS, CRSE_ID, EFFDT, DESCR, EQUIV_CRSE_ID, CONSENT, ALLOW_MULT_ENROLL, UNITS_MINIMUM, UNITS_MAXIMUM, UNITS_ACAD_PROG, UNITS_FINAID_PROG, CRSE_REPEATABLE, '
                        + 'UNITS_REPEAT_LIMIT, CRSE_REPEAT_LIMIT, GRADING_BASIS, GRADE_ROSTER_PRINT, SSR_COMPONENT, COURSE_TITLE_LONG, LST_MULT_TRM_CRS, CRSE_CONTACT_HRS, RQMNT_DESIGNTN, '
                        + 'CRSE_COUNT, INSTRUCTOR_EDIT, FEES_EXIST, COMPONENT_PRIMARY, ENRL_UN_LD_CLC_TYP, SSR_DROP_CONSENT, SCC_ROW_ADD_OPRID, SCC_ROW_ADD_DTTM, SCC_ROW_UPD_OPRID, SCC_ROW_UPD_DTTM '
                        + 'FROM PS_CRSE_CATALOG'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_CRSE_COMPONENT',
                    query: 'SELECT * FROM PS_CRSE_COMPONENT'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_CRSE_OFFER',
                    query: 'SELECT * FROM PS_CRSE_OFFER'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_DEGREE_TBL',
                    query: 'SELECT * FROM PS_DEGREE_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_EMAIL_ADDRESSES',
                    query: 'SELECT EMPLID, PREF_EMAIL_FLAG, EMAIL_ADDR FROM PS_EMAIL_ADDRESSES'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_EVENT_LAST_TBL',
                    query: 'SELECT * FROM PS_EVENT_LAST_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_FACILITY_TBL',
                    query: 'SELECT * FROM PS_FACILITY_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_MILESTONE_TBL',
                    query: 'SELECT * FROM PS_MILESTONE_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_NAMES',
                    query: "SELECT EMPLID, NAME, LAST_NAME, FIRST_NAME, MIDDLE_NAME, NAME_TYPE, CASE WHEN EFFDT < date '1901-01-01' THEN date '1901-01-01' ELSE EFFDT END as EFFDT FROM PS_NAMES"
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_RQ_COND_LINE',
                    query: 'SELECT CONDITION_SPEC, EFFDT, COND_LINE_SEQ, COND_PROCESS_TYPE, COND_PROCESS_ID, CONDITION_CODE, CONDITION_OPERATOR, CONDITION_DATA, '
                        + 'TEST_ID, TEST_COMPONENT, SCORE, SAA_MAX_VALID_AGE, SAA_BEST_TEST_OPT '
                        + 'FROM PS_RQ_COND_LINE'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_RQ_COND_LN_DETL',
                    query: 'SELECT CONDITION_SPEC, EFFDT, COND_LINE_SEQ, COND_LN_DETL_SEQ, INSTITUTION, ACAD_CAREER, ACAD_PROG, ACAD_PLAN, ACAD_SUB_PLAN, MILESTONE, '
                        + 'MILESTONE_COMPLETE, MILESTONE_LEVEL, MILESTONE_NBR, MILESTONE_TITLE, GRADE_POINTS_MIN, DEGREE '
                        + 'FROM PS_RQ_COND_LN_DETL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_RQ_CONDITION',
                    query: 'SELECT CONDITION_SPEC, EFFDT, EFF_STATUS, INSTITUTION, RQ_CONNECT_TYPE, RQRMNT_USEAGE, COND_TYPE, SAA_CALC_TST_SCORE, SAA_CALC_TST_MTHD, '
                        + 'SAA_TST_SCORE_GRP, TEST_ID, CONDITION_OPERATOR, SCORE, SAA_MAX_VALID_AGE, SAA_BEST_TEST_OPT, DESCR, DESCRSHORT, DESCR254A '
                        + 'FROM PS_RQ_CONDITION'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_RQ_ENT_GRP_DETL',
                    query: 'SELECT RQ_ENTITY_GROUP, EFFDT, ENT_GRP_ITEM_NBR, ACAD_PROG, ACAD_PLAN, ACAD_SUB_PLAN, ACAD_STNDNG_STAT, STDNT_GROUP, INSTITUTION '
                        + 'FROM PS_RQ_ENT_GRP_DETL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_RQ_ENTITY_GROUP',
                    query: 'SELECT RQ_ENTITY_GROUP, EFFDT, EFF_STATUS, INSTITUTION, ACAD_CAREER, RQRMNT_USEAGE, ENTITY_GROUP_TYPE, DESCR, DESCRSHORT, DESCR254A ' +
                        'FROM PS_RQ_ENTITY_GROUP'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_RQ_GRP_DETL_TBL',
                    query: 'SELECT RQRMNT_GROUP, EFFDT, RQ_LINE_KEY_NBR, RQ_GRP_LINE_NBR, RQ_GRP_LINE_TYPE, MIN_UNITS_REQD, MIN_CRSES_REQD, REQUISITE_TYPE, REQUIREMENT, CONDITION_CODE, '
                        + 'CONDITION_OPERATOR, CONDITION_DATA, INSTITUTION, ACAD_GROUP, SUBJECT, CATALOG_NBR, WILD_PATTERN_TYPE, CRSE_ID, TRNSFR_LVL_ALLOWD, TEST_CRDT_ALLOWD, OTHR_CRDT_ALLOWD, '
                        + 'INCL_GPA_REQ, EXCL_IP_CREDIT, GRADE_POINTS_MIN, UNITS_MINIMUM, INCLUDE_EQUIVALENT, CRSVALID_BEGIN, CRSVALID_END, STRM, ASSOCIATED_CLASS, CRS_TOPIC_ID, '
                        + 'RQMNT_DESIGNTN, RQ_CONNECT, PARENTHESIS, TEST_ID, TEST_COMPONENT, SCORE, SAA_MAX_VALID_AGE, SAA_BEST_TEST_OPT, SSR_DESCR80 '
                        + 'FROM PS_RQ_GRP_DETL_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_RQ_GRP_TBL',
                    query: 'SELECT RQRMNT_GROUP, EFFDT, EFF_STATUS, DESCR, DESCRSHORT, RQRMNT_USEAGE, INSTITUTION, ACAD_CAREER, ACAD_GROUP, ACAD_PROG, ACAD_PLAN, ACAD_SUB_PLAN, ACAD_CAREER_INC, '
                        + 'ACAD_PROG_INC, ACAD_PLAN_INC, ACAD_SUBPLAN_INC, SUBJECT, CATALOG_NBR, RQRMNT_LIST_SEQ, RQ_CONNECT_TYPE, SPECIAL_PROCESSING, MIN_UNITS_REQD, MIN_CRSES_REQD, '
                        + 'GRADE_POINTS_MIN, GPA_REQUIRED, REQ_CRSSELECT_METH, CREDIT_INCL_MODE, RQ_REPORTING, SAA_DISPLAY_GPA, SAA_DISPLAY_UNITS, SAA_DISPLAY_CRSCNT, CONDITION_CODE, CONDITION_OPERATOR, '
                        + 'CONDITION_DATA, REQCH_RESOLV_METH, REQCH_STOP_RULE, RQ_MIN_LINES, RQ_MAX_LINES, RQ_PARTITION_SHR, OTH_PLN_SPLN_REQ, PLN_SPLN_RQD_NBR, ENABLE_CATLG_PRINT, OVRD_STD_DESCR, '
                        + 'TEST_ID, TEST_COMPONENT, SCORE, SAA_MAX_VALID_AGE, SAA_BEST_TEST_OPT, SAA_HIDE_STATUS, SAA_DESCR80, DESCR254A '
                        + 'FROM PS_RQ_GRP_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_RQ_LINE_TBL',
                    query: 'SELECT REQUIREMENT, EFFDT, RQ_LINE_KEY_NBR, RQ_LINE_NBR, DESCR, DESCRSHORT, FULL_SET_RPN, SPECIAL_PROCESSING, REQ_LINE_TYPE, RQ_CONNECT, CREDIT_INCL_MODE, REQ_CRSSELECT_METH, '
                        + 'CT_COND_COMPLEMENT, MIN_UNITS_REQD, MIN_CRSES_REQD, MAX_UNITS_ALLOWD, MAX_CRSES_ALLOWD, GRADE_POINTS_MIN, GPA_REQUIRED, GPA_MAXIMUM, RQ_REPORTING, SAA_DISPLAY_GPA, '
                        + 'SAA_DISPLAY_UNITS, SAA_DISPLAY_CRSCNT, CONDITION_CODE, CONDITION_OPERATOR, CONDITION_DATA, COUNT_ATTEMPTS, DISP_SELECT_LINE, ENABLE_SPLITTING, RQ_PRINT_CNTL, PARENTHESIS, '
                        + 'SAA_COMPLEX_RQ_LN, TEST_ID, TEST_COMPONENT, SCORE, SAA_MAX_VALID_AGE, SAA_BEST_TEST_OPT, SAA_HIDE_STATUS, SAA_DESCR80, DESCR254A, SAA_DESCR254 '
                        + 'FROM PS_RQ_LINE_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_RQ_LN_DETL_TBL',
                    query: 'SELECT  REQUIREMENT, EFFDT, RQ_LINE_KEY_NBR, RQ_LINE_DET_SEQ, RQ_LINE_DET_TYPE, LIST_INCLUDE_MODE, LIST_RECALL_MODE, LIST_INTERP, RQRMNT_GROUP, REF_REQUIREMENT, RQ_LINE_NBR, '
                    + 'REF_NUMBER, REF_DATA, COURSE_LIST, INSTITUTION, ACAD_CAREER, CONDITION_CODE, CONDITION_OPERATOR, CONDITION_DATA, IGNORE_MSNG_TGT, TEST_ID, TEST_COMPONENT, SCORE, '
                    + 'SAA_MAX_VALID_AGE, SAA_BEST_TEST_OPT, CRSE_ATTR, CRSE_ATTR_VALUE, DESCR254A '
                    + 'FROM PS_RQ_LN_DETL_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_RQ_MAIN_TBL',
                    query: 'SELECT REQUIREMENT, EFFDT, EFF_STATUS, DESCR, DESCRSHORT, RQRMNT_USEAGE, INSTITUTION, ACAD_CAREER, ACAD_GROUP, ACAD_PROG, ACAD_PLAN, ACAD_SUB_PLAN, SUBJECT, CATALOG_NBR, ' 
                        + 'RQRMNT_LIST_SEQ, RQ_CONNECT_TYPE, SPECIAL_PROCESSING, MIN_UNITS_REQD, MIN_CRSES_REQD, GRADE_POINTS_MIN, GPA_REQUIRED, REQ_CRSSELECT_METH, CREDIT_INCL_MODE, RQ_REPORTING, '
                        + 'SAA_DISPLAY_GPA, SAA_DISPLAY_UNITS, SAA_DISPLAY_CRSCNT, CONDITION_CODE, CONDITION_OPERATOR, CONDITION_DATA, REQCH_RESOLV_METH, REQCH_STOP_RULE, RQ_MIN_LINES, RQ_MAX_LINES, '
                        + 'RQ_PARTITION_SHR, RQ_PRINT_CNTL, TEST_ID, TEST_COMPONENT, SCORE, SAA_MAX_VALID_AGE, SAA_BEST_TEST_OPT, SAA_HIDE_STATUS, SAA_DESCR80, DESCR254A '
                        + 'FROM PS_RQ_MAIN_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_RQMNT_DESIG_TBL',
                    query: 'SELECT * FROM PS_RQMNT_DESIG_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_SCTN_CMBND',
                    query: 'SELECT * FROM PS_SCTN_CMBND'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_SCTN_CMBND_TBL',
                    query: 'SELECT * FROM PS_SCTN_CMBND_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_STDNT_CAR_MLSTN',
                    query: 'SELECT MILESTONE, MILESTONE_COMPLETE, INSTITUTION, EFFDT, EMPLID '
                        + 'FROM PS_STDNT_CAR_MLSTN'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_STDNT_CAR_TERM',
                    query: 'SELECT EMPLID, ELIG_TO_ENROLL, STRM, ACAD_CAREER, ACAD_PROG_PRIMARY, STDNT_CAR_NBR, '
                        + 'ACADEMIC_LOAD, UNT_TAKEN_GPA, UNT_TRNSFR, UNT_INPROG_GPA, UNT_TAKEN_NOGPA, '
                        + 'UNT_INPROG_NOGPA, WITHDRAW_CODE, ACAD_LEVEL_EOT, INSTITUTION, ACAD_LOAD_APPR '
                        + 'FROM PS_STDNT_CAR_TERM'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_STDNT_CRS_SUBS',
                    query: 'SELECT * FROM PS_STDNT_CRS_SUBS'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_STDNT_ENRL',
                    query: 'SELECT STRM, SESSION_CODE, CLASS_NBR, EMPLID, STDNT_ENRL_STATUS, ACAD_CAREER, ENRL_STATUS_REASON, '
                        + 'CRSE_GRADE_OFF, EARN_CREDIT, UNT_EARNED, UNT_TAKEN, UNITS_ATTEMPTED, GRADE_POINTS, '
                        + 'CRSE_COUNT, INSTITUTION, ROWID '
                        + 'FROM PS_STDNT_ENRL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_STDNT_GROUP_TBL',
                    query: 'SELECT * FROM PS_STDNT_GROUP_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_STDNT_GRPS_HIST',
                    query: 'SELECT EFFDT, EMPLID, STDNT_GROUP, INSTITUTION '
                        + 'FROM PS_STDNT_GRPS_HIST'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_STDNT_MLSTN',
                    query: 'SELECT * FROM PS_STDNT_MLSTN'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_STDNT_TEST_COMP',
                    query: 'SELECT TEST_DT, EMPLID, TEST_ID, TEST_COMPONENT, SCORE '
                        + 'FROM PS_STDNT_TEST_COMP'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_SUBJECT_TBL',
                    query: 'SELECT * FROM PS_SUBJECT_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_TERM_TBL',
                    query: 'SELECT * FROM PS_TERM_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_TRNS_CRSE_DTL',
                    query: 'SELECT EMPLID, ACAD_CAREER, INSTITUTION, MODEL_NBR, ARTICULATION_TERM, CRSE_ID, '
                        + 'CRSE_OFFER_NBR, ROWID, TRNSFR_STAT, EARN_CREDIT, UNT_TRNSFR, CRSE_GRADE_INPUT, DESCR, UNT_TAKEN '
                        + 'FROM PS_TRNS_CRSE_DTL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_TRNS_CRSE_SCH',
                    query: 'SELECT EMPLID, ACAD_CAREER, INSTITUTION, MODEL_NBR, TRNSFR_SRC_TYPE '
                        + 'FROM PS_TRNS_CRSE_SCH'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_TRNS_CRSE_TERM',
                    query: 'SELECT EMPLID, ACAD_CAREER, INSTITUTION, MODEL_NBR, ARTICULATION_TERM, TRF_GRADE_POINTS '
                        + 'FROM PS_TRNS_CRSE_TERM'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_TRNS_TEST_DTL',
                    query: 'SELECT CRSE_ID, LS_DATA_SOURCE, TEST_DT, DESCR, TEST_COMPONENT, TEST_ID, TRNSFR_EQVLNCY_CMP, TST_EQVLNCY, TRNSFR_STAT, ARTICULATION_TERM, INSTITUTION, ACAD_CAREER, EMPLID, SSR_FAWI_INCL, '
                        + 'GRADE_CATEGORY, VALID_ATTEMPT, OVRD_RSN, OVRD_TRCR_FL, REJECT_REASON, INPUT_CHG_FL ,FREEZE_REC_FL, RQMNT_DESIGNTN, REPEAT_CODE, UNITS_ATTEMPTED, INCLUDE_IN_GPA ,EARN_CREDIT, '
                        + 'CRSE_GRADE_OFF, GRADING_BASIS, GRADING_SCHEME, SCORE, UNT_TRNSFR, GRD_PTS_PER_UNIT, CRSE_OFFER_NBR, PERCENTILE, TRNSFR_EQVLNCY_SEQ, TRNSFR_EQVLNCY_GRP, MODEL_NBR, ROWID '
                        + 'FROM PS_TRNS_TEST_DTL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_TST_CREDIT_COMP',
                    query: 'SELECT * FROM PS_TST_CREDIT_COMP'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PSXLATITEM',
                    query: 'SELECT * from PSXLATITEM'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_UA_DT_SEQ',
                    query: 'SELECT UA_DT_UNITS, UA_DT_REQ_SEM, UA_DT_REQ_PRIORITY, REQUIREMENT, EFFDT, RQ_LINE_KEY_NBR '
                        + 'FROM PS_UA_DT_SEQ'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_UA_DT_STD_RSLT',
                    query: 'SELECT EMPLID, UA_DT_PLNR_CRS_SEQ, ITEM_R_STATUS, UA_DT_SOURCE, STRM, UA_DT_COMP_STRM, CRSE_ID, UA_DT_COMP_CRSE_ID, '
                        + 'CRSE_OFFER_NBR,	UA_DT_UNITS, UA_DT_REQ_SEM, UA_DT_REMOVED, UA_DT_MODE '
                        + 'FROM PS_UA_DT_STD_RSLT'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_SAA_ADB_RESULTS',
                    query: 'SELECT EMPLID, ANALYSIS_DB_SEQ,SAA_ENTRY_SEQ, RPT_DATE, TSCRPT_TYPE, ENTRY_R_TYPE, RQ_DATE, RQRMNT_GROUP, '
                        + 'RQ_GRP_LINE_NBR, REQUIREMENT, RQ_LINE_NBR, UNITS_REQUIRED, SAA_UNITS_USED, CRSES_REQUIRED, SAA_CRSES_USED, '
                        + 'GPA_ACTUAL, ITEM_R_STATUS, SAA_PRINT_CNTL, SAA_CAREER_RPT '
                        + "FROM PS_SAA_ADB_RESULTS WHERE RPT_DATE >= To_Date('01/01/2017 01:01:01 AM', 'MM/DD/YYYY HH:MI:SS AM')"
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_SAA_ADB_COURSES',
                    query: 'SELECT DISTINCT EMPLID, ANALYSIS_DB_SEQ, CRSE_TAG, RPT_DATE, TSCRPT_TYPE, Earn_Credit, grading_basis_enrl, '
                        + 'UNT_EARNED, INCLUDE_IN_GPA, GRADE_POINTS, CRSE_ID, CATALOG_NBR, SAA_CAREER_RPT, RQMNT_DESIGNTN, SUBJECT '
                        + "FROM PS_SAA_ADB_COURSES WHERE RPT_DATE >= To_Date('01/01/2017 01:01:01 AM', 'MM/DD/YYYY HH:MI:SS AM')"
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_SAA_ADB_CRSEUSE',
                    query: 'SELECT RQRMNT_GROUP, REQUIREMENT, RQ_LINE_NBR, SAA_ENTRY_SEQ, SAA_COURSE_SEQ, EMPLID, ANALYSIS_DB_SEQ, CRSE_TAG, '
                        + 'TSCRPT_TYPE, SAA_CAREER_RPT, RPT_DATE, SEL_PROCESS_TYPE, SEL_MODE, UNT_EARNED '
                        + "FROM PS_SAA_ADB_CRSEUSE WHERE RPT_DATE >= TO_DATE('01/01/2017 01:01:01 AM', 'MM/DD/YYYY HH:MI:SS AM')"
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_SAA_ADB_CRSEAVL',
                    query: 'SELECT EMPLID, ANALYSIS_DB_SEQ, SAA_ENTRY_SEQ, CRSE_ID, RQMNT_DESIGNTN, SUBJECT, CATALOG_NBR, '
                        + 'SAA_COURSE_SEQ, RQRMNT_GROUP, REQUIREMENT, RQ_LINE_NBR, SAA_CAREER_RPT, TSCRPT_TYPE, RPT_DATE '
                        + "FROM PS_SAA_ADB_CRSEAVL WHERE RPT_DATE >= TO_DATE('01/01/2017 01:01:01 AM', 'MM/DD/YYYY HH:MI:SS AM')"
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_CLASS_CHRSTC',
                    query: 'SELECT * FROM PS_CLASS_CHRSTC'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_ROOM_CHRSTC_TBL',
                    query: 'SELECT * FROM PS_ROOM_CHRSTC_TBL'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_AA_OVERRIDE_SCHEMA',
                    query: 'SELECT ROWID, A.* FROM PS_AA_OVERRIDE'
                });
                PEOPLESOFT_TEMPLATE_STATEMENTS.push({
                    name: 'PS_AA_OVRD_CRSDATA_SCHEMA',
                    query: 'SELECT ROWID FROM PS_AA_OVRD_CRSDATA'
                });

                return {
                    queries: PEOPLESOFT_TEMPLATE_STATEMENTS,
                    type: integrationType
                };
            }
            case IntegrationType.Demo: {
                const DEMO_TEMPLATE_STATEMENTS: IQueryDefinition[] = new Array<IQueryDefinition>();

                DEMO_TEMPLATE_STATEMENTS.push({
                    name: 'ALL_TABLES',
                    query: 'SELECT * FROM ALL_TABLES'
                });

                return {
                    queries: DEMO_TEMPLATE_STATEMENTS,
                    type: integrationType
                };
            }
            default: {
                throw Error('Unsupported integration type in IntegrationConfigFactory');
            }
        }
    }
}
