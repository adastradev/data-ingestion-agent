
import 'reflect-metadata';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import commands from '../../cli/commands';

const expect = chai.expect;

describe('commands', () => {
  describe('getIntegrationTypes', () => {
    it('should produce valid choice options for each integration type', () => {
      // tslint:disable-next-line: no-string-literal
      expect(commands['wizard']).to.exist;
    });
  });
});
