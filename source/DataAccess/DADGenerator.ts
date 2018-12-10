'use strict'

import IntegrationConfigFactory from '../IntegrationConfigFactory';
import { IIntegrationConfig, IntegrationType } from '../IIntegrationConfig';
import { writeFile } from 'fs';

let integrationTypes = [
    IntegrationType.Banner,
    IntegrationType.DegreeWorks
]