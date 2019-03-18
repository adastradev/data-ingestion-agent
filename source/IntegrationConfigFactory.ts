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
        const statements: IQueryDefinition[] = new Array<IQueryDefinition>();
        switch (integrationType) {
            case IntegrationType.Banner: {
                statements.push({
                    name: 'SORCONT',
                    query: 'Select * from SORCONT'
                });
                statements.push({
                    name: 'STVTMST',
                    query: 'Select * from STVTMST'
                });
                statements.push({
                    name: 'SCBCRKY',
                    query: 'Select * from SCBCRKY'
                });
                statements.push({
                    name: 'SCBCRSE',
                    query: 'Select * from SCBCRSE'
                });
                statements.push({
                    name: 'SCRATTR',
                    query: 'Select * from SCRATTR'
                });
                statements.push({
                    name: 'SCRCORQ',
                    query: 'Select * from SCRCORQ'
                });
                statements.push({
                    name: 'SCREQIV',
                    query: 'Select * from SCREQIV'
                });
                statements.push({
                    name: 'SCRLEVL',
                    query: 'Select * from SCRLEVL'
                });
                statements.push({
                    name: 'SCRRARE',
                    query: 'Select * from SCRRARE'
                });
                statements.push({
                    name: 'SCRRCAM',
                    query: 'Select * from SCRRCAM'
                });
                statements.push({
                    name: 'SCRRCLS',
                    query: 'Select * from SCRRCLS'
                });
                statements.push({
                    name: 'SCRRCOL',
                    query: 'Select * from SCRRCOL'
                });
                statements.push({
                    name: 'SCRRDEG',
                    query: 'Select * from SCRRDEG'
                });
                statements.push({
                    name: 'SCRRLVL',
                    query: 'Select * from SCRRLVL'
                });
                statements.push({
                    name: 'SCRRMAJ',
                    query: 'Select * from SCRRMAJ'
                });
                statements.push({
                    name: 'SCRRPRG',
                    query: 'Select * from SCRRPRG'
                });
                statements.push({
                    name: 'SCRRTST',
                    query: 'Select * from SCRRTST'
                });
                statements.push({
                    name: 'SCRSCHD',
                    query: 'Select * from SCRSCHD'
                });
                statements.push({
                    name: 'SFRSTCR',
                    query: 'select SFRSTCR_PIDM, SFRSTCR_ACTIVITY_DATE, SFRSTCR_CREDIT_HR, SFRSTCR_CRN, '
                    + 'SFRSTCR_LEVL_CODE, SFRSTCR_RSTS_CODE, SFRSTCR_TERM_CODE, ROWID from SFRSTCR'
                });
                statements.push({
                    name: 'SGRCLSR',
                    query: 'Select * from SGRCLSR'
                });
                statements.push({
                    name: 'SGRSATT',
                    query: 'select SGRSATT_PIDM, SGRSATT_ATTS_CODE, SGRSATT_TERM_CODE_EFF, ROWID from SGRSATT'
                });
                statements.push({
                    name: 'SHRATTC',
                    query: 'select SHRATTC_TERM_CODE, SHRATTC_CRN, SHRATTC_ATTR_CODE from SHRATTC'
                });
                statements.push({
                    name: 'SHRATTR',
                    query: 'select SHRATTR_PIDM, SHRATTR_TERM_CODE, SHRATTR_ATTR_CODE, SHRATTR_TCKN_SEQ_NO from SHRATTR'
                });
                statements.push({
                    name: 'SHRDGMR',
                    query: 'select SHRDGMR_PIDM, SHRDGMR_DEGC_CODE, SHRDGMR_DEGS_CODE, SHRDGMR_SEQ_NO, '
                    + 'SHRDGMR_TERM_CODE_GRAD from SHRDGMR'
                });
                statements.push({
                    name: 'SHRGRDE',
                    query: 'Select SHRGRDE_CODE, SHRGRDE_GPA_IND, SHRGRDE_COMPLETED_IND, SHRGRDE_LEVL_CODE, '
                    + 'SHRGRDE_QUALITY_POINTS, SHRGRDE_TERM_CODE_EFFECTIVE, SHRGRDE_ACTIVITY_DATE, '
                    + 'SHRGRDE_GRDE_STATUS_IND FROM SHRGRDE'
                });
                statements.push({
                    name: 'SHRTATT',
                    query: 'select SHRTATT_PIDM, SHRTATT_TRIT_SEQ_NO, SHRTATT_TRAM_SEQ_NO, SHRTATT_TRCR_SEQ_NO, '
                    + 'SHRTATT_TRCE_SEQ_NO, SHRTATT_ATTR_CODE from SHRTATT'
                });
                statements.push({
                    name: 'SHRTCKG',
                    query: 'select SHRTCKG_PIDM, SHRTCKG_TERM_CODE, SHRTCKG_TCKN_SEQ_NO, SHRTCKG_SEQ_NO, '
                    + 'SHRTCKG_CREDIT_HOURS, SHRTCKG_GRDE_CODE_FINAL, SHRTCKG_ACTIVITY_DATE from SHRTCKG'
                });
                statements.push({
                    name: 'SHRTCKL',
                    query: 'select SHRTCKL_PIDM, SHRTCKL_TERM_CODE, SHRTCKL_TCKN_SEQ_NO, SHRTCKL_LEVL_CODE, '
                    + 'SHRTCKL_ACTIVITY_DATE, ROWID from SHRTCKL'
                });
                statements.push({
                    name: 'SHRTCKN',
                    query: 'select SHRTCKN_PIDM, SHRTCKN_CRN, SHRTCKN_TERM_CODE, SHRTCKN_SEQ_NO, SHRTCKN_SUBJ_CODE, '
                    + 'SHRTCKN_CRSE_NUMB, SHRTCKN_REPEAT_COURSE_IND, SHRTCKN_CRSE_TITLE, '
                    + 'SHRTCKN_ACTIVITY_DATE from SHRTCKN'
                });
                statements.push({
                    name: 'SHRTGPA',
                    query: 'select SHRTGPA_PIDM, SHRTGPA_TERM_CODE, SHRTGPA_HOURS_EARNED, SHRTGPA_GPA_TYPE_IND '
                    + 'from SHRTGPA'
                });
                statements.push({
                    name: 'SHRTRCE',
                    query: 'select SHRTRCE_PIDM, SHRTRCE_TERM_CODE_EFF, SHRTRCE_GRDE_CODE, SHRTRCE_LEVL_CODE, '
                    + 'SHRTRCE_SUBJ_CODE,SHRTRCE_CRSE_NUMB, SHRTRCE_CREDIT_HOURS, SHRTRCE_REPEAT_COURSE, '
                    + 'SHRTRCE_CRSE_TITLE, SHRTRCE_TRIT_SEQ_NO, SHRTRCE_TRAM_SEQ_NO, SHRTRCE_SEQ_NO, '
                    + 'SHRTRCE_ACTIVITY_DATE, ROWID from SHRTRCE'
                });

                statements.push({
                    name: 'SIRASGN',
                    query: 'Select * from SIRASGN'
                });
                statements.push({
                    name: 'SLBBLDG',
                    query: 'Select * from SLBBLDG'
                });
                statements.push({
                    name: 'SLBRDEF',
                    query: 'Select * from SLBRDEF'
                });
                statements.push({
                    name: 'SMBAGEN',
                    query: 'Select * from SMBAGEN'
                });
                statements.push({
                    name: 'SMBARUL',
                    query: 'Select * from SMBARUL'
                });
                statements.push({
                    name: 'SMBGGEN',
                    query: 'Select * from SMBGGEN'
                });
                statements.push({
                    name: 'SMBGRUL',
                    query: 'Select * from SMBGRUL'
                });
                statements.push({
                    name: 'SMBPGEN',
                    query: 'Select * from SMBPGEN'
                });
                statements.push({
                    name: 'SMBSAGN',
                    query: 'Select * from SMBSAGN'
                });
                statements.push({
                    name: 'SMBSARU',
                    query: 'Select * from SMBSARU'
                });
                statements.push({
                    name: 'SMBSGGN',
                    query: 'Select * from SMBSGGN'
                });
                statements.push({
                    name: 'SMBSGRU',
                    query: 'Select * from SMBSGRU'
                });
                statements.push({
                    name: 'SMBSLIB',
                    query: 'Select * from SMBSLIB'
                });
                statements.push({
                    name: 'SMBSPGN',
                    query: 'Select * from SMBSPGN'
                });
                statements.push({
                    name: 'SMRACAA',
                    query: 'Select * from SMRACAA'
                });
                statements.push({
                    name: 'SMRACCM',
                    query: 'Select * from SMRACCM'
                });
                statements.push({
                    name: 'SMRACMT',
                    query: 'Select * from SMRACMT'
                });
                statements.push({
                    name: 'SMRAEXL',
                    query: 'Select * from SMRAEXL'
                });
                statements.push({
                    name: 'SMRAGAM',
                    query: 'Select * from SMRAGAM'
                });
                statements.push({
                    name: 'SMRALIB',
                    query: 'Select * from SMRALIB'
                });
                statements.push({
                    name: 'SMRAQUA',
                    query: 'Select * from SMRAQUA'
                });
                statements.push({
                    name: 'SMRAREX',
                    query: 'Select * from SMRAREX'
                });
                statements.push({
                    name: 'SMRARSA',
                    query: 'Select * from SMRARSA'
                });
                statements.push({
                    name: 'SMRARUL',
                    query: 'Select * from SMRARUL'
                });
                statements.push({
                    name: 'SMRGCAA',
                    query: 'Select * from SMRGCAA'
                });
                statements.push({
                    name: 'SMRGCCM',
                    query: 'Select * from SMRGCCM'
                });
                statements.push({
                    name: 'SMRGCMT',
                    query: 'Select * from SMRGCMT'
                });
                statements.push({
                    name: 'SMRGEXL',
                    query: 'Select * from SMRGEXL'
                });
                statements.push({
                    name: 'SMRGLIB',
                    query: 'Select * from SMRGLIB'
                });
                statements.push({
                    name: 'SMRGRCM',
                    query: 'Select * from SMRGRCM'
                });
                statements.push({
                    name: 'SMRGREX',
                    query: 'Select * from SMRGREX'
                });
                statements.push({
                    name: 'SMRGRSA',
                    query: 'Select * from SMRGRSA'
                });
                statements.push({
                    name: 'SMRGRUL',
                    query: 'Select * from SMRGRUL'
                });
                statements.push({
                    name: 'SMRIEAT',
                    query: 'Select * from SMRIEAT'
                });
                statements.push({
                    name: 'SMRIECC',
                    query: 'Select * from SMRIECC'
                });
                statements.push({
                    name: 'SMRIECO',
                    query: 'Select * from SMRIECO'
                });
                statements.push({
                    name: 'SMRIECP',
                    query: 'Select * from SMRIECP'
                });
                statements.push({
                    name: 'SMRIEDG',
                    query: 'Select * from SMRIEDG'
                });
                statements.push({
                    name: 'SMRIEDP',
                    query: 'Select * from SMRIEDP'
                });
                statements.push({
                    name: 'SMRIEMJ',
                    query: 'Select * from SMRIEMJ'
                });
                statements.push({
                    name: 'SMRIEMN',
                    query: 'Select * from SMRIEMN'
                });
                statements.push({
                    name: 'SMRPAAP',
                    query: 'Select * from SMRPAAP'
                });
                statements.push({
                    name: 'SMRPRLE',
                    query: 'Select * from SMRPRLE'
                });
                statements.push({
                    name: 'SMRPRSA',
                    query: 'Select * from SMRPRSA'
                });
                statements.push({
                    name: 'SMRSACA',
                    query: 'Select * from SMRSACA'
                });
                statements.push({
                    name: 'SMRSACE',
                    query: 'Select * from SMRSACE'
                });
                statements.push({
                    name: 'SMRSACM',
                    query: 'Select * from SMRSACM'
                });
                statements.push({
                    name: 'SMRSACT',
                    query: 'Select * from SMRSACT'
                });
                statements.push({
                    name: 'SMRSAGM',
                    query: 'Select * from SMRSAGM'
                });
                statements.push({
                    name: 'SMRSARE',
                    query: 'Select * from SMRSARE'
                });
                statements.push({
                    name: 'SMRSARS',
                    query: 'Select * from SMRSARS'
                });
                statements.push({
                    name: 'SMRSARU',
                    query: 'Select * from SMRSARU'
                });
                statements.push({
                    name: 'SMRSGAV',
                    query: 'Select * from SMRSGAV'
                });
                statements.push({
                    name: 'SMRSGCA',
                    query: 'Select * from SMRSGCA'
                });
                statements.push({
                    name: 'SMRSGCE',
                    query: 'Select * from SMRSGCE'
                });
                statements.push({
                    name: 'SMRSGCM',
                    query: 'Select * from SMRSGCM'
                });
                statements.push({
                    name: 'SMRSGCT',
                    query: 'Select * from SMRSGCT'
                });
                statements.push({
                    name: 'SMRSGRE',
                    query: 'Select * from SMRSGRE'
                });
                statements.push({
                    name: 'SMRSGRS',
                    query: 'Select * from SMRSGRS'
                });
                statements.push({
                    name: 'SMRSGRU',
                    query: 'Select * from SMRSGRU'
                });
                statements.push({
                    name: 'SMRSPRS',
                    query: 'Select * from SMRSPRS'
                });
                statements.push({
                    name: 'SMRSSUB',
                    query: 'Select * from SMRSSUB'
                });
                statements.push({
                    name: 'SMRSTRG',
                    query: 'Select * from SMRSTRG'
                });
                statements.push({
                    name: 'SMRSWAV',
                    query: 'Select * from SMRSWAV'
                });
                statements.push({
                    name: 'SOBPTRM',
                    query: 'Select * from SOBPTRM'
                });
                statements.push({
                    name: 'SPRIDEN',
                    query: 'select * from SPRIDEN s where SPRIDEN_CHANGE_IND IS NULL'
                });
                statements.push({
                    name: 'SSBSECT',
                    query: 'select * From SSBSECT'
                });
                statements.push({
                    name: 'SSBXLST',
                    query: 'Select * from SSBXLST'
                });
                statements.push({
                    name: 'SSRMEET',
                    query: 'Select * from SSRMEET'
                });
                statements.push({
                    name: 'SSRXLST',
                    query: 'Select * from SSRXLST'
                });
                statements.push({
                    name: 'STVATTR',
                    query: 'Select * from STVATTR'
                });
                statements.push({
                    name: 'STVATTS',
                    query: 'Select * from STVATTS'
                });
                statements.push({
                    name: 'STVBLDG',
                    query: 'Select * from STVBLDG'
                });
                statements.push({
                    name: 'STVCAMP',
                    query: 'Select * from STVCAMP'
                });
                statements.push({
                    name: 'STVCLAS',
                    query: 'Select * from STVCLAS'
                });
                statements.push({
                    name: 'STVCOLL',
                    query: 'select STVCOLL_CODE, STVCOLL_DESC from STVCOLL'
                });
                statements.push({
                    name: 'STVCSTA',
                    query: 'Select * from STVCSTA'
                });
                statements.push({
                    name: 'STVDEGC',
                    query: 'Select * from STVDEGC'
                });
                statements.push({
                    name: 'STVDEGS',
                    query: 'select STVDEGS_CODE, STVDEGS_AWARD_STATUS_IND from STVDEGS'
                });
                statements.push({
                    name: 'STVDEPT',
                    query: 'Select * from STVDEPT'
                });
                statements.push({
                    name: 'STVDIVS',
                    query: 'Select * from STVDIVS'
                });
                statements.push({
                    name: 'STVLEVL',
                    query: 'Select * from STVLEVL'
                });
                statements.push({
                    name: 'STVMAJR',
                    query: 'Select STVMAJR_CODE, STVMAJR_DESC, STVMAJR_CIPC_CODE, STVMAJR_VALID_MAJOR_IND, '
                    + 'STVMAJR_VALID_MINOR_IND, STVMAJR_VALID_CONCENTRATN_IND, STVMAJR_ACTIVITY_DATE, '
                    + 'STVMAJR_OCCUPATION_IND, STVMAJR_AID_ELIGIBILITY_IND, STVMAJR_SYSTEM_REQ_IND, '
                    + 'STVMAJR_VR_MSG_NO, STVMAJR_SEVIS_EQUIV, STVMAJR_SURROGATE_ID, STVMAJR_VERSION, STVMAJR_USER_ID, '
                    + 'STVMAJR_DATA_ORIGIN, STVMAJR_VPDI_CODE from STVMAJR'
                });
                statements.push({
                    name: 'STVRESD',
                    query: 'Select STVRESD_CODE, STVRESD_DESC, STVRESD_IN_STATE_IND, STVRESD_ACTIVITY_DATE, '
                    + 'STVRESD_SYSTEM_REQ_IND, STVRESD_VR_MSG_NO, STVRESD_EDI_EQUIV, STVRESD_SURROGATE_ID, '
                    + 'STVRESD_VERSION, STVRESD_USER_ID, STVRESD_DATA_ORIGIN, STVRESD_VPDI_CODE from STVRESD'
                });
                statements.push({
                    name: 'STVRSTS',
                    query: 'select STVRSTS_CODE, STVRSTS_INCL_ASSESS, STVRSTS_ACTIVITY_DATE from STVRSTS'
                });
                statements.push({
                    name: 'STVSCHD',
                    query: 'Select * from STVSCHD'
                });
                statements.push({
                    name: 'STVSTST',
                    query: 'Select * from STVSTST'
                });
                statements.push({
                    name: 'STVSTYP',
                    query: 'Select * from STVSTYP'
                });
                statements.push({
                    name: 'STVSUBJ',
                    query: 'Select * from STVSUBJ'
                });
                statements.push({
                    name: 'STVTERM',
                    query: 'Select * from STVTERM'
                });
                statements.push({
                    name: 'STVPTRM',
                    query: 'Select * from STVPTRM'
                });
                statements.push({
                    name: 'SORTEST',
                    query: 'Select * from SORTEST'
                });
                statements.push({
                    name: 'SGBSTDN',
                    query: 'Select * from SGBSTDN'
                });
                statements.push({
                    name: 'STVSESS',
                    query: 'Select * from STVSESS'
                });
                statements.push({
                    name: 'STVSSTS',
                    query: 'Select * from STVSSTS'
                });
                statements.push({
                    name: 'GTVMTYP',
                    query: 'Select * from GTVMTYP'
                });
                statements.push({
                    name: 'GTVINSM',
                    query: 'Select * from GTVINSM'
                });
                statements.push({
                    name: 'GOREMAL',
                    query: 'Select * from GOREMAL'
                });

                return {
                    queries: statements,
                    type: integrationType
                };
            }
            case IntegrationType.DegreeWorks: {
                statements.push({
                    name: 'DAP_RESULT_DTL',
                    query: 'SELECT DAP_STU_ID, DAP_AUDIT_TYPE, DAP_DEGREE, DAP_BLOCK_SEQ_NUM, '
                        + 'DAP_RESULT_SEQ_NUM, DAP_REQ_ID, DAP_RULE_ID, DAP_RESULT_TYPE, '
                        + 'DAP_VALUE1, DAP_SCHOOL, DAP_VALUE2, DAP_VALUE3, DAP_VALUE4, '
                        + 'DAP_FREETEXT, DAP_CREATE_DATE, Unique_ID, DAP_NODE_TYPE '
                    + 'FROM DAP_RESULT_DTL'
                });

                statements.push({
                    name: 'CPA_CLASSNEEDED',
                    query: 'SELECT STU_ID, REQ_ID, RULE_ID, RESULT_TYPE, WITH_ADVICE, RESULT_SEQ_NUM '
                    + 'FROM CPA_CLASSNEEDED'
                });

                return {
                    queries: statements,
                    type: integrationType
                };
            }
            case IntegrationType.PeopleSoft: {
                statements.push({
                    name: 'PS_AA_OVERRIDE',
                    query: 'SELECT DESCR254A, ACAD_SUB_PLAN, ACAD_PLAN, ACAD_PROG, ACAD_CAREER, INSTITUTION, OPRID, RQ_AA_OVRD_OPLEVEL, RQ_AA_OVRD_OPCODE, '
                        + 'RQ_AA_WHO_DATA, RQ_AA_WHO_CODE, DESCRSHORT, DESCR, EFF_STATUS, EFFDT,RQ_AA_OVERRIDE, ROWID '
                        + 'FROM PS_AA_OVERRIDE'
                });
                statements.push({
                    name: 'PS_AA_OVRD_CRSDATA',
                    query: 'SELECT RQ_AA_OVERRIDE, RQ_AA_OVRD_LN_NBR, RQ_AA_OVRD_CRS_NBR, RQ_CRSE_SOURCE, CRSE_ID, EFFDT, CRSE_OFFER_NBR, STRM, CLASS_NBR, SUBJECT, CATALOG_NBR, '
                        + 'SESSION_CODE, CLASS_SECTION, CRS_TOPIC_ID, CRSES_DIRECTED, UNITS_DIRECTED, DIRCT_TYPE, GRADE_POINTS_MIN, ACAD_GROUP, TRNSFR_EQVLNCY_GRP, TRNSFR_EQVLNCY_SEQ, '
                        + 'MODEL_NBR, CRSE_GRADE_OFF, UNT_EARNED, RQMNT_DESIGNTN, RQMNT_DESIGNTN_GRD, RQMNT_DESIGNTN_OPT, ROWID '
                        + 'FROM PS_AA_OVRD_CRSDATA'
                });
                statements.push({
                    name: 'PS_AA_OVRD_DATA',
                    query: 'SELECT * FROM PS_AA_OVRD_DATA'
                });
                statements.push({
                    name: 'PS_AA_OVRD_WHERE',
                    query: 'SELECT * FROM PS_AA_OVRD_WHERE'
                });
                statements.push({
                    name: 'PS_CRSE_ATTRIBUTES',
                    query: 'SELECT * FROM PS_CRSE_ATTRIBUTES'
                });
                statements.push({
                    name: 'PS_CRSE_ATTR_TBL',
                    query: 'SELECT * FROM PS_CRSE_ATTR_TBL'
                });
                statements.push({
                    name: 'PS_ACAD_DEGR',
                    query: 'SELECT * FROM PS_ACAD_DEGR'
                });
                statements.push({
                    name: 'PS_ACAD_GROUP_TBL',
                    query: 'SELECT * FROM PS_ACAD_GROUP_TBL'
                });
                statements.push({
                    name: 'PS_ACAD_LEVEL_TBL',
                    query: 'SELECT * FROM PS_ACAD_LEVEL_TBL'
                });
                statements.push({
                    name: 'PS_ACAD_ORG_TBL',
                    query: 'SELECT * FROM PS_ACAD_ORG_TBL'
                });
                statements.push({
                    name: 'PS_ACAD_PLAN',
                    query: 'SELECT EMPLID, ACAD_PLAN, STDNT_CAR_NBR, ACAD_CAREER, EFFSEQ, EFFDT '
                        + 'FROM PS_ACAD_PLAN'
                });
                statements.push({
                    name: 'PS_ACAD_PLAN_TBL',
                    query: 'SELECT * FROM PS_ACAD_PLAN_TBL'
                });
                statements.push({
                    name: 'PS_ACAD_PROG',
                    query: 'SELECT EMPLID, ACAD_CAREER, ACAD_PROG, DEGR_CHKOUT_STAT, STDNT_CAR_NBR, REQ_TERM, EFFDT, EFFSEQ, INSTITUTION '
                        + 'FROM PS_ACAD_PROG'
                });
                statements.push({
                    name: 'PS_ACAD_PROG_TBL',
                    query: 'SELECT * FROM PS_ACAD_PROG_TBL'
                });
                statements.push({
                    name: 'PS_ACAD_SUBPLAN',
                    query: 'SELECT EMPLID, ACAD_PLAN, ACAD_SUB_PLAN, STDNT_CAR_NBR, ACAD_CAREER, EFFDT, EFFSEQ '
                        + 'FROM PS_ACAD_SUBPLAN'
                });
                statements.push({
                    name: 'PS_ACAD_SUBPLN_TBL',
                    query: 'SELECT * FROM PS_ACAD_SUBPLN_TBL'
                });
                statements.push({
                    name: 'PS_CAMPUS_EVENT',
                    query: 'SELECT * FROM PS_CAMPUS_EVENT'
                });
                statements.push({
                    name: 'PS_CAMPUS_EVNT_LNG',
                    query: 'SELECT * FROM PS_CAMPUS_EVNT_LNG'
                });
                statements.push({
                    name: 'PS_CAMPUS_LOC_TBL',
                    query: 'SELECT * FROM PS_CAMPUS_LOC_TBL'
                });
                statements.push({
                    name: 'PS_CAMPUS_MTG',
                    query: 'SELECT * FROM PS_CAMPUS_MTG'
                });
                statements.push({
                    name: 'PS_CAMPUS_TBL',
                    query: 'SELECT * FROM PS_CAMPUS_TBL'
                });
                statements.push({
                    name: 'PS_CLASS_INSTR',
                    query: 'SELECT * FROM PS_CLASS_INSTR'
                });
                statements.push({
                    name: 'PS_CLASS_MTG_PAT',
                    query: 'SELECT * FROM PS_CLASS_MTG_PAT'
                });
                statements.push({
                    name: 'PS_CLASS_TBL',
                    query: 'SELECT * FROM PS_CLASS_TBL'
                });
                statements.push({
                    name: 'PS_CLST_DETL_TBL',
                    query: 'Select COURSE_LIST, EFFDT, R_COURSE_SEQUENCE, WILDCARD_IND, CRSVALID_BEGIN, CRSVALID_END, TRNSFR_LVL_ALLOWD, TEST_CRDT_ALLOWD, OTHR_CRDT_ALLOWD, INCL_GPA_REQ, '
                        + 'EXCL_IP_CREDIT, GRADE_POINTS_MIN, UNITS_MINIMUM, INSTITUTION, ACAD_GROUP, SUBJECT, CATALOG_NBR, WILD_PATTERN_TYPE, CRSE_ID, INCLUDE_EQUIVALENT, STRM, '
                        + 'ASSOCIATED_CLASS, CRS_TOPIC_ID, RQMNT_DESIGNTN, SAA_DSP_WILD_CRSES, DESCR, SAA_DESCR254 '
                        + 'FROM PS_CLST_DETL_TBL'
                });
                statements.push({
                    name: 'PS_CLST_MAIN_TBL',
                    query: 'Select COURSE_LIST, EFFDT, EFF_STATUS, DESCR, DESCRSHORT, RQRMNT_USEAGE, INSTITUTION, ACAD_CAREER, ACAD_GROUP, ACAD_PROG, ACAD_PLAN, '
                        + 'ACAD_SUB_PLAN, SUBJECT, CATALOG_NBR, DESCR254A '
                        + 'FROM PS_CLST_MAIN_TBL'
                });
                statements.push({
                    name: 'PS_CRSE_CATALOG',
                    query: 'SELECT EFF_STATUS, CRSE_ID, EFFDT, DESCR, EQUIV_CRSE_ID, CONSENT, ALLOW_MULT_ENROLL, UNITS_MINIMUM, UNITS_MAXIMUM, UNITS_ACAD_PROG, UNITS_FINAID_PROG, CRSE_REPEATABLE, '
                        + 'UNITS_REPEAT_LIMIT, CRSE_REPEAT_LIMIT, GRADING_BASIS, GRADE_ROSTER_PRINT, SSR_COMPONENT, COURSE_TITLE_LONG, LST_MULT_TRM_CRS, CRSE_CONTACT_HRS, RQMNT_DESIGNTN, '
                        + 'CRSE_COUNT, INSTRUCTOR_EDIT, FEES_EXIST, COMPONENT_PRIMARY, ENRL_UN_LD_CLC_TYP, SSR_DROP_CONSENT, SCC_ROW_ADD_OPRID, SCC_ROW_ADD_DTTM, SCC_ROW_UPD_OPRID, SCC_ROW_UPD_DTTM '
                        + 'FROM PS_CRSE_CATALOG'
                });
                statements.push({
                    name: 'PS_CRSE_COMPONENT',
                    query: 'SELECT * FROM PS_CRSE_COMPONENT'
                });
                statements.push({
                    name: 'PS_CRSE_OFFER',
                    query: 'SELECT * FROM PS_CRSE_OFFER'
                });
                statements.push({
                    name: 'PS_DEGREE_TBL',
                    query: 'SELECT * FROM PS_DEGREE_TBL'
                });
                statements.push({
                    name: 'PS_EMAIL_ADDRESSES',
                    query: 'SELECT EMPLID, PREF_EMAIL_FLAG, EMAIL_ADDR FROM PS_EMAIL_ADDRESSES'
                });
                statements.push({
                    name: 'PS_EVENT_LAST_TBL',
                    query: 'SELECT * FROM PS_EVENT_LAST_TBL'
                });
                statements.push({
                    name: 'PS_FACILITY_TBL',
                    query: 'SELECT * FROM PS_FACILITY_TBL'
                });
                statements.push({
                    name: 'PS_MILESTONE_TBL',
                    query: 'SELECT * FROM PS_MILESTONE_TBL'
                });
                statements.push({
                    name: 'PS_NAMES',
                    query: "SELECT EMPLID, NAME, LAST_NAME, FIRST_NAME, MIDDLE_NAME, NAME_TYPE, CASE WHEN EFFDT < date '1901-01-01' THEN date '1901-01-01' ELSE EFFDT END as EFFDT FROM PS_NAMES"
                });
                statements.push({
                    name: 'PS_RQ_COND_LINE',
                    query: 'SELECT CONDITION_SPEC, EFFDT, COND_LINE_SEQ, COND_PROCESS_TYPE, COND_PROCESS_ID, CONDITION_CODE, CONDITION_OPERATOR, CONDITION_DATA, '
                        + 'TEST_ID, TEST_COMPONENT, SCORE, SAA_MAX_VALID_AGE, SAA_BEST_TEST_OPT '
                        + 'FROM PS_RQ_COND_LINE'
                });
                statements.push({
                    name: 'PS_RQ_COND_LN_DETL',
                    query: 'SELECT CONDITION_SPEC, EFFDT, COND_LINE_SEQ, COND_LN_DETL_SEQ, INSTITUTION, ACAD_CAREER, ACAD_PROG, ACAD_PLAN, ACAD_SUB_PLAN, MILESTONE, '
                        + 'MILESTONE_COMPLETE, MILESTONE_LEVEL, MILESTONE_NBR, MILESTONE_TITLE, GRADE_POINTS_MIN, DEGREE '
                        + 'FROM PS_RQ_COND_LN_DETL'
                });
                statements.push({
                    name: 'PS_RQ_CONDITION',
                    query: 'SELECT CONDITION_SPEC, EFFDT, EFF_STATUS, INSTITUTION, RQ_CONNECT_TYPE, RQRMNT_USEAGE, COND_TYPE, SAA_CALC_TST_SCORE, SAA_CALC_TST_MTHD, '
                        + 'SAA_TST_SCORE_GRP, TEST_ID, CONDITION_OPERATOR, SCORE, SAA_MAX_VALID_AGE, SAA_BEST_TEST_OPT, DESCR, DESCRSHORT, DESCR254A '
                        + 'FROM PS_RQ_CONDITION'
                });
                statements.push({
                    name: 'PS_RQ_ENT_GRP_DETL',
                    query: 'SELECT RQ_ENTITY_GROUP, EFFDT, ENT_GRP_ITEM_NBR, ACAD_PROG, ACAD_PLAN, ACAD_SUB_PLAN, ACAD_STNDNG_STAT, STDNT_GROUP, INSTITUTION '
                        + 'FROM PS_RQ_ENT_GRP_DETL'
                });
                statements.push({
                    name: 'PS_RQ_ENTITY_GROUP',
                    query: 'SELECT RQ_ENTITY_GROUP, EFFDT, EFF_STATUS, INSTITUTION, ACAD_CAREER, RQRMNT_USEAGE, ENTITY_GROUP_TYPE, DESCR, DESCRSHORT, DESCR254A ' +
                        'FROM PS_RQ_ENTITY_GROUP'
                });
                statements.push({
                    name: 'PS_RQ_GRP_DETL_TBL',
                    query: 'SELECT RQRMNT_GROUP, EFFDT, RQ_LINE_KEY_NBR, RQ_GRP_LINE_NBR, RQ_GRP_LINE_TYPE, MIN_UNITS_REQD, MIN_CRSES_REQD, REQUISITE_TYPE, REQUIREMENT, CONDITION_CODE, '
                        + 'CONDITION_OPERATOR, CONDITION_DATA, INSTITUTION, ACAD_GROUP, SUBJECT, CATALOG_NBR, WILD_PATTERN_TYPE, CRSE_ID, TRNSFR_LVL_ALLOWD, TEST_CRDT_ALLOWD, OTHR_CRDT_ALLOWD, '
                        + 'INCL_GPA_REQ, EXCL_IP_CREDIT, GRADE_POINTS_MIN, UNITS_MINIMUM, INCLUDE_EQUIVALENT, CRSVALID_BEGIN, CRSVALID_END, STRM, ASSOCIATED_CLASS, CRS_TOPIC_ID, '
                        + 'RQMNT_DESIGNTN, RQ_CONNECT, PARENTHESIS, TEST_ID, TEST_COMPONENT, SCORE, SAA_MAX_VALID_AGE, SAA_BEST_TEST_OPT, SSR_DESCR80 '
                        + 'FROM PS_RQ_GRP_DETL_TBL'
                });
                statements.push({
                    name: 'PS_RQ_GRP_TBL',
                    query: 'SELECT RQRMNT_GROUP, EFFDT, EFF_STATUS, DESCR, DESCRSHORT, RQRMNT_USEAGE, INSTITUTION, ACAD_CAREER, ACAD_GROUP, ACAD_PROG, ACAD_PLAN, ACAD_SUB_PLAN, ACAD_CAREER_INC, '
                        + 'ACAD_PROG_INC, ACAD_PLAN_INC, ACAD_SUBPLAN_INC, SUBJECT, CATALOG_NBR, RQRMNT_LIST_SEQ, RQ_CONNECT_TYPE, SPECIAL_PROCESSING, MIN_UNITS_REQD, MIN_CRSES_REQD, '
                        + 'GRADE_POINTS_MIN, GPA_REQUIRED, REQ_CRSSELECT_METH, CREDIT_INCL_MODE, RQ_REPORTING, SAA_DISPLAY_GPA, SAA_DISPLAY_UNITS, SAA_DISPLAY_CRSCNT, CONDITION_CODE, CONDITION_OPERATOR, '
                        + 'CONDITION_DATA, REQCH_RESOLV_METH, REQCH_STOP_RULE, RQ_MIN_LINES, RQ_MAX_LINES, RQ_PARTITION_SHR, OTH_PLN_SPLN_REQ, PLN_SPLN_RQD_NBR, ENABLE_CATLG_PRINT, OVRD_STD_DESCR, '
                        + 'TEST_ID, TEST_COMPONENT, SCORE, SAA_MAX_VALID_AGE, SAA_BEST_TEST_OPT, SAA_HIDE_STATUS, SAA_DESCR80, DESCR254A '
                        + 'FROM PS_RQ_GRP_TBL'
                });
                statements.push({
                    name: 'PS_RQ_LINE_TBL',
                    query: 'SELECT REQUIREMENT, EFFDT, RQ_LINE_KEY_NBR, RQ_LINE_NBR, DESCR, DESCRSHORT, FULL_SET_RPN, SPECIAL_PROCESSING, REQ_LINE_TYPE, RQ_CONNECT, CREDIT_INCL_MODE, REQ_CRSSELECT_METH, '
                        + 'CT_COND_COMPLEMENT, MIN_UNITS_REQD, MIN_CRSES_REQD, MAX_UNITS_ALLOWD, MAX_CRSES_ALLOWD, GRADE_POINTS_MIN, GPA_REQUIRED, GPA_MAXIMUM, RQ_REPORTING, SAA_DISPLAY_GPA, '
                        + 'SAA_DISPLAY_UNITS, SAA_DISPLAY_CRSCNT, CONDITION_CODE, CONDITION_OPERATOR, CONDITION_DATA, COUNT_ATTEMPTS, DISP_SELECT_LINE, ENABLE_SPLITTING, RQ_PRINT_CNTL, PARENTHESIS, '
                        + 'SAA_COMPLEX_RQ_LN, TEST_ID, TEST_COMPONENT, SCORE, SAA_MAX_VALID_AGE, SAA_BEST_TEST_OPT, SAA_HIDE_STATUS, SAA_DESCR80, DESCR254A, SAA_DESCR254 '
                        + 'FROM PS_RQ_LINE_TBL'
                });
                statements.push({
                    name: 'PS_RQ_LN_DETL_TBL',
                    query: 'SELECT  REQUIREMENT, EFFDT, RQ_LINE_KEY_NBR, RQ_LINE_DET_SEQ, RQ_LINE_DET_TYPE, LIST_INCLUDE_MODE, LIST_RECALL_MODE, LIST_INTERP, RQRMNT_GROUP, REF_REQUIREMENT, RQ_LINE_NBR, '
                    + 'REF_NUMBER, REF_DATA, COURSE_LIST, INSTITUTION, ACAD_CAREER, CONDITION_CODE, CONDITION_OPERATOR, CONDITION_DATA, IGNORE_MSNG_TGT, TEST_ID, TEST_COMPONENT, SCORE, '
                    + 'SAA_MAX_VALID_AGE, SAA_BEST_TEST_OPT, CRSE_ATTR, CRSE_ATTR_VALUE, DESCR254A '
                    + 'FROM PS_RQ_LN_DETL_TBL'
                });
                statements.push({
                    name: 'PS_RQ_MAIN_TBL',
                    query: 'SELECT REQUIREMENT, EFFDT, EFF_STATUS, DESCR, DESCRSHORT, RQRMNT_USEAGE, INSTITUTION, ACAD_CAREER, ACAD_GROUP, ACAD_PROG, ACAD_PLAN, ACAD_SUB_PLAN, SUBJECT, CATALOG_NBR, '
                        + 'RQRMNT_LIST_SEQ, RQ_CONNECT_TYPE, SPECIAL_PROCESSING, MIN_UNITS_REQD, MIN_CRSES_REQD, GRADE_POINTS_MIN, GPA_REQUIRED, REQ_CRSSELECT_METH, CREDIT_INCL_MODE, RQ_REPORTING, '
                        + 'SAA_DISPLAY_GPA, SAA_DISPLAY_UNITS, SAA_DISPLAY_CRSCNT, CONDITION_CODE, CONDITION_OPERATOR, CONDITION_DATA, REQCH_RESOLV_METH, REQCH_STOP_RULE, RQ_MIN_LINES, RQ_MAX_LINES, '
                        + 'RQ_PARTITION_SHR, RQ_PRINT_CNTL, TEST_ID, TEST_COMPONENT, SCORE, SAA_MAX_VALID_AGE, SAA_BEST_TEST_OPT, SAA_HIDE_STATUS, SAA_DESCR80, DESCR254A '
                        + 'FROM PS_RQ_MAIN_TBL'
                });
                statements.push({
                    name: 'PS_RQMNT_DESIG_TBL',
                    query: 'SELECT * FROM PS_RQMNT_DESIG_TBL'
                });
                statements.push({
                    name: 'PS_SCTN_CMBND',
                    query: 'SELECT * FROM PS_SCTN_CMBND'
                });
                statements.push({
                    name: 'PS_SCTN_CMBND_TBL',
                    query: 'SELECT * FROM PS_SCTN_CMBND_TBL'
                });
                statements.push({
                    name: 'PS_STDNT_CAR_MLSTN',
                    query: 'SELECT MILESTONE, MILESTONE_COMPLETE, INSTITUTION, EFFDT, EMPLID '
                        + 'FROM PS_STDNT_CAR_MLSTN'
                });
                statements.push({
                    name: 'PS_STDNT_CAR_TERM',
                    query: 'SELECT EMPLID, ELIG_TO_ENROLL, STRM, ACAD_CAREER, ACAD_PROG_PRIMARY, STDNT_CAR_NBR, '
                        + 'ACADEMIC_LOAD, UNT_TAKEN_GPA, UNT_TRNSFR, UNT_INPROG_GPA, UNT_TAKEN_NOGPA, '
                        + 'UNT_INPROG_NOGPA, WITHDRAW_CODE, ACAD_LEVEL_EOT, INSTITUTION, ACAD_LOAD_APPR '
                        + 'FROM PS_STDNT_CAR_TERM'
                });
                statements.push({
                    name: 'PS_STDNT_CRS_SUBS',
                    query: 'SELECT * FROM PS_STDNT_CRS_SUBS'
                });
                statements.push({
                    name: 'PS_STDNT_ENRL',
                    query: 'SELECT STRM, SESSION_CODE, CLASS_NBR, EMPLID, STDNT_ENRL_STATUS, ACAD_CAREER, ENRL_STATUS_REASON, '
                        + 'CRSE_GRADE_OFF, EARN_CREDIT, UNT_EARNED, UNT_TAKEN, UNITS_ATTEMPTED, GRADE_POINTS, '
                        + 'CRSE_COUNT, INSTITUTION, ROWID '
                        + 'FROM PS_STDNT_ENRL'
                });
                statements.push({
                    name: 'PS_STDNT_GROUP_TBL',
                    query: 'SELECT * FROM PS_STDNT_GROUP_TBL'
                });
                statements.push({
                    name: 'PS_STDNT_GRPS_HIST',
                    query: 'SELECT EFFDT, EMPLID, STDNT_GROUP, INSTITUTION '
                        + 'FROM PS_STDNT_GRPS_HIST'
                });
                statements.push({
                    name: 'PS_STDNT_MLSTN',
                    query: 'SELECT * FROM PS_STDNT_MLSTN'
                });
                statements.push({
                    name: 'PS_STDNT_TEST_COMP',
                    query: 'SELECT TEST_DT, EMPLID, TEST_ID, TEST_COMPONENT, SCORE '
                        + 'FROM PS_STDNT_TEST_COMP'
                });
                statements.push({
                    name: 'PS_SUBJECT_TBL',
                    query: 'SELECT * FROM PS_SUBJECT_TBL'
                });
                statements.push({
                    name: 'PS_TERM_TBL',
                    query: 'SELECT * FROM PS_TERM_TBL'
                });
                statements.push({
                    name: 'PS_TRNS_CRSE_DTL',
                    query: 'SELECT EMPLID, ACAD_CAREER, INSTITUTION, MODEL_NBR, ARTICULATION_TERM, CRSE_ID, '
                        + 'CRSE_OFFER_NBR, ROWID, TRNSFR_STAT, EARN_CREDIT, UNT_TRNSFR, CRSE_GRADE_INPUT, DESCR, UNT_TAKEN '
                        + 'FROM PS_TRNS_CRSE_DTL'
                });
                statements.push({
                    name: 'PS_TRNS_CRSE_SCH',
                    query: 'SELECT EMPLID, ACAD_CAREER, INSTITUTION, MODEL_NBR, TRNSFR_SRC_TYPE '
                        + 'FROM PS_TRNS_CRSE_SCH'
                });
                statements.push({
                    name: 'PS_TRNS_CRSE_TERM',
                    query: 'SELECT EMPLID, ACAD_CAREER, INSTITUTION, MODEL_NBR, ARTICULATION_TERM, TRF_GRADE_POINTS '
                        + 'FROM PS_TRNS_CRSE_TERM'
                });
                statements.push({
                    name: 'PS_TRNS_TEST_DTL',
                    query: 'SELECT CRSE_ID, LS_DATA_SOURCE, TEST_DT, DESCR, TEST_COMPONENT, TEST_ID, TRNSFR_EQVLNCY_CMP, TST_EQVLNCY, TRNSFR_STAT, ARTICULATION_TERM, INSTITUTION, ACAD_CAREER, EMPLID, SSR_FAWI_INCL, '
                        + 'GRADE_CATEGORY, VALID_ATTEMPT, OVRD_RSN, OVRD_TRCR_FL, REJECT_REASON, INPUT_CHG_FL ,FREEZE_REC_FL, RQMNT_DESIGNTN, REPEAT_CODE, UNITS_ATTEMPTED, INCLUDE_IN_GPA ,EARN_CREDIT, '
                        + 'CRSE_GRADE_OFF, GRADING_BASIS, GRADING_SCHEME, SCORE, UNT_TRNSFR, GRD_PTS_PER_UNIT, CRSE_OFFER_NBR, PERCENTILE, TRNSFR_EQVLNCY_SEQ, TRNSFR_EQVLNCY_GRP, MODEL_NBR, ROWID '
                        + 'FROM PS_TRNS_TEST_DTL'
                });
                statements.push({
                    name: 'PS_TST_CREDIT_COMP',
                    query: 'SELECT * FROM PS_TST_CREDIT_COMP'
                });
                statements.push({
                    name: 'PSXLATITEM',
                    query: 'SELECT * from PSXLATITEM'
                });
                statements.push({
                    name: 'PS_UA_DT_SEQ',
                    query: 'SELECT UA_DT_UNITS, UA_DT_REQ_SEM, UA_DT_REQ_PRIORITY, REQUIREMENT, EFFDT, RQ_LINE_KEY_NBR '
                        + 'FROM PS_UA_DT_SEQ'
                });
                statements.push({
                    name: 'PS_UA_DT_STD_RSLT',
                    query: 'SELECT EMPLID, UA_DT_PLNR_CRS_SEQ, ITEM_R_STATUS, UA_DT_SOURCE, STRM, UA_DT_COMP_STRM, CRSE_ID, UA_DT_COMP_CRSE_ID, '
                        + 'CRSE_OFFER_NBR,	UA_DT_UNITS, UA_DT_REQ_SEM, UA_DT_REMOVED, UA_DT_MODE '
                        + 'FROM PS_UA_DT_STD_RSLT'
                });
                statements.push({
                    name: 'PS_SAA_ADB_RESULTS',
                    query: 'SELECT EMPLID, ANALYSIS_DB_SEQ,SAA_ENTRY_SEQ, RPT_DATE, TSCRPT_TYPE, ENTRY_R_TYPE, RQ_DATE, RQRMNT_GROUP, '
                        + 'RQ_GRP_LINE_NBR, REQUIREMENT, RQ_LINE_NBR, UNITS_REQUIRED, SAA_UNITS_USED, CRSES_REQUIRED, SAA_CRSES_USED, '
                        + 'GPA_ACTUAL, ITEM_R_STATUS, SAA_PRINT_CNTL, SAA_CAREER_RPT '
                        + "FROM PS_SAA_ADB_RESULTS WHERE RPT_DATE >= To_Date('01/01/2017 01:01:01 AM', 'MM/DD/YYYY HH:MI:SS AM')"
                });
                statements.push({
                    name: 'PS_SAA_ADB_COURSES',
                    query: 'SELECT DISTINCT EMPLID, ANALYSIS_DB_SEQ, CRSE_TAG, RPT_DATE, TSCRPT_TYPE, Earn_Credit, grading_basis_enrl, '
                        + 'UNT_EARNED, INCLUDE_IN_GPA, GRADE_POINTS, CRSE_ID, CATALOG_NBR, SAA_CAREER_RPT, RQMNT_DESIGNTN, SUBJECT '
                        + "FROM PS_SAA_ADB_COURSES WHERE RPT_DATE >= To_Date('01/01/2017 01:01:01 AM', 'MM/DD/YYYY HH:MI:SS AM')"
                });
                statements.push({
                    name: 'PS_SAA_ADB_CRSEUSE',
                    query: 'SELECT RQRMNT_GROUP, REQUIREMENT, RQ_LINE_NBR, SAA_ENTRY_SEQ, SAA_COURSE_SEQ, EMPLID, ANALYSIS_DB_SEQ, CRSE_TAG, '
                        + 'TSCRPT_TYPE, SAA_CAREER_RPT, RPT_DATE, SEL_PROCESS_TYPE, SEL_MODE, UNT_EARNED '
                        + "FROM PS_SAA_ADB_CRSEUSE WHERE RPT_DATE >= TO_DATE('01/01/2017 01:01:01 AM', 'MM/DD/YYYY HH:MI:SS AM')"
                });
                statements.push({
                    name: 'PS_SAA_ADB_CRSEAVL',
                    query: 'SELECT EMPLID, ANALYSIS_DB_SEQ, SAA_ENTRY_SEQ, CRSE_ID, RQMNT_DESIGNTN, SUBJECT, CATALOG_NBR, '
                        + 'SAA_COURSE_SEQ, RQRMNT_GROUP, REQUIREMENT, RQ_LINE_NBR, SAA_CAREER_RPT, TSCRPT_TYPE, RPT_DATE '
                        + "FROM PS_SAA_ADB_CRSEAVL WHERE RPT_DATE >= TO_DATE('01/01/2017 01:01:01 AM', 'MM/DD/YYYY HH:MI:SS AM')"
                });
                statements.push({
                    name: 'PS_CLASS_CHRSTC',
                    query: 'SELECT * FROM PS_CLASS_CHRSTC'
                });
                statements.push({
                    name: 'PS_ROOM_CHRSTC_TBL',
                    query: 'SELECT * FROM PS_ROOM_CHRSTC_TBL'
                });
                statements.push({
                    name: 'PS_AA_OVERRIDE_SCHEMA',
                    query: 'SELECT ROWID, A.* FROM PS_AA_OVERRIDE A'
                });
                statements.push({
                    name: 'PS_AA_OVRD_CRSDATA_SCHEMA',
                    query: 'SELECT ROWID FROM PS_AA_OVRD_CRSDATA'
                });

                return {
                    queries: statements,
                    type: integrationType
                };
            }
            case IntegrationType.Colleague: {
                statements.push({
                    name: 'ACAD_CREDENTIALS',
                    query: 'Select * from ACAD_CREDENTIALS'
                });
                statements.push({
                    name: 'ACAD_LEVELS',
                    query: 'Select * from ACAD_LEVELS'
                });
                statements.push({
                    name: 'ACAD_PROGRAM_REQMTS',
                    query: 'Select * from ACAD_PROGRAM_REQMTS'
                });
                statements.push({
                    name: 'ACAD_PROGRAM_REQMTS_LS',
                    query: 'Select * from ACAD_PROGRAM_REQMTS_LS'
                });
                statements.push({
                    name: 'ACAD_PROGRAMS',
                    query: 'Select * from ACAD_PROGRAMS'
                });
                statements.push({
                    name: 'ACAD_PROGRAMS_LS',
                    query: 'Select * from ACAD_PROGRAMS_LS'
                });
                statements.push({
                    name: 'ACAD_REQMT_BLOCKS',
                    query: 'Select * from ACAD_REQMT_BLOCKS'
                });
                statements.push({
                    name: 'ACAD_REQMT_BLOCKS_LS',
                    query: 'Select * from ACAD_REQMT_BLOCKS_LS'
                });
                statements.push({
                    name: 'ACAD_REQMTS',
                    query: 'Select * from ACAD_REQMTS'
                });
                statements.push({
                    name: 'APPROVAL_STATUS',
                    query: 'Select * from APPROVAL_STATUS'
                });
                statements.push({
                    name: 'BUILDINGS',
                    query: 'Select * from BUILDINGS'
                });
                statements.push({
                    name: 'CLASSES',
                    query: 'Select * from CLASSES'
                });
                statements.push({
                    name: 'COURSE_CONTACT',
                    query: 'Select * from COURSE_CONTACT'
                });
                statements.push({
                    name: 'COURSE_COREQS',
                    query: 'Select * from COURSE_COREQS'
                });
                statements.push({
                    name: 'COURSE_DEPTS',
                    query: 'Select * from COURSE_DEPTS'
                });
                statements.push({
                    name: 'COURSE_EQUATE_CODES_LS',
                    query: 'Select * from COURSE_EQUATE_CODES_LS'
                });
                statements.push({
                    name: 'COURSE_SEC_MEETING',
                    query: 'Select * from COURSE_SEC_MEETING'
                });
                statements.push({
                    name: 'COURSE_SECTIONS',
                    query: 'Select * from COURSE_SECTIONS'
                });
                statements.push({
                    name: 'COURSES',
                    query: 'Select * from COURSES'
                });
                statements.push({
                    name: 'COURSES_LS',
                    query: 'Select * from COURSES_LS'
                });
                statements.push({
                    name: 'DEPTS',
                    query: 'Select * from DEGREES'
                });
                statements.push({
                    name: 'DEPTS',
                    query: 'Select * from DEPTS'
                });
                statements.push({
                    name: 'DIVISIONS',
                    query: 'Select * from DIVISIONS'
                });
                statements.push({
                    name: 'GRADES',
                    query: 'Select * from GRADES'
                });
                statements.push({
                    name: 'INSTR_METHODS',
                    query: 'Select * from INSTR_METHODS'
                });
                statements.push({
                    name: 'LOCATIONS',
                    query: 'Select * from LOCATIONS'
                });
                statements.push({
                    name: 'MAJORS',
                    query: 'Select * from MAJORS'
                });
                statements.push({
                    name: 'MINORS',
                    query: 'Select * from MINORS'
                });
                statements.push({
                    name: 'PERSON',
                    query: 'Select ID, FIRST_NAME,LAST_NAME,MIDDLE_NAME,DECEASED_DATE from PERSON'
                });
                statements.push({
                    name: 'PROGRAM_STATUS',
                    query: 'Select * from PROGRAM_STATUS'
                });
                statements.push({
                    name: 'ROOMS',
                    query: 'Select * from ROOMS'
                });
                statements.push({
                    name: 'RPHONES',
                    query: 'Select * from RPHONES'
                });
                statements.push({
                    name: 'RULES',
                    query: 'Select * from RULES'
                });
                statements.push({
                    name: 'RULES_CHECK',
                    query: 'Select * from RULES_CHECK'
                });
                statements.push({
                    name: 'SEC_STATUSES',
                    query: 'Select * from SEC_STATUSES'
                });
                statements.push({
                    name: 'STC_STATUSES',
                    query: 'Select * from STC_STATUSES'
                });
                statements.push({
                    name: 'STPR_MAJOR_LIST',
                    query: 'Select * from STPR_MAJOR_LIST'
                });
                statements.push({
                    name: 'STPR_MINOR_LIST',
                    query: 'Select * from STPR_MINOR_LIST'
                });
                statements.push({
                    name: 'STPR_STATUSES',
                    query: 'Select * from STPR_STATUSES'
                });
                statements.push({
                    name: 'STU_TYPE_INFO',
                    query: 'Select * from STU_TYPE_INFO'
                });
                statements.push({
                    name: 'STUDENT_ACAD_CRED',
                    query: 'Select * from STUDENT_ACAD_CRED'
                });
                statements.push({
                    name: 'STUDENT_ACAD_LEVELS',
                    query: 'Select * from STUDENT_ACAD_LEVELS'
                });
                statements.push({
                    name: 'STUDENT_COURSE_SEC',
                    query: 'Select * from STUDENT_COURSE_SEC'
                });
                statements.push({
                    name: 'STUDENT_HIATUS',
                    query: 'Select * from STUDENT_HIATUS'
                });
                statements.push({
                    name: 'STUDENT_NON_COURSES',
                    query: 'Select * from STUDENT_NON_COURSES'
                });
                statements.push({
                    name: 'STUDENT_TYPES',
                    query: 'Select * from STUDENT_TYPES'
                });
                statements.push({
                    name: 'STUDENT_PROGRAMS',
                    query: 'Select * from STUDENT_PROGRAMS'
                });
                statements.push({
                    name: 'SUBJECTS',
                    query: 'Select * from SUBJECTS'
                });
                statements.push({
                    name: 'TERMS',
                    query: 'Select * from TERMS'
                });
                statements.push({
                    name: 'VALS',
                    query: 'Select * from VALS'
                });
                statements.push({
                    name: 'HIATUS_CODES',
                    query: 'Select * from HIATUS_CODES'
                });
                statements.push({
                    name: 'ADMIT_STATUSES',
                    query: 'Select * from ADMIT_STATUSES'
                });
                statements.push({
                    name: 'CATALOGS',
                    query: 'Select * from CATALOGS'
                });

                return {
                    queries: statements,
                    type: IntegrationType.NotImplemented
                };
            }
            case IntegrationType.Demo: {
                statements.push({
                    name: 'ALL_TABLES',
                    query: 'SELECT * FROM ALL_TABLES'
                });

                return {
                    queries: statements,
                    type: integrationType
                };
            }
            default: {
                throw Error(`Unknown integration type ${integrationType.toString()}`);
            }
        }
    }
}
