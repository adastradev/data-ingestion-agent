
import "reflect-metadata";
import * as chai from 'chai';
import * as AWS from "aws-sdk-mock";

import S3Writer from "../../source/DataAccess/S3/S3Writer";
import { Readable } from "stream";
import * as oracledb from "oracledb";
import sinon = require("sinon");
import OracleReader from "../../source/DataAccess/Oracle/OracleReader";
import container from "./test.inversify.config";
import { Logger } from "winston";
import TYPES from "../../ioc.types";

const expect = chai.expect;

describe('OracleReader', () => {
    describe('when previewing queries', () => {
        var sandbox: sinon.SinonSandbox;
        beforeEach(function() {
            sandbox = sinon.createSandbox();
        });

        afterEach(function() {
            sandbox.restore();
        });

        it("should log the queries", () => {
            let logger: Logger = container.get<Logger>(TYPES.Logger);
            
            let oracleReader: OracleReader = new OracleReader(logger);
            let spy = sandbox.spy(logger, "log");

            oracleReader.logQueries();
            expect(spy.calledOnce).to.be.true;
        });
    });

    describe('when ingesting data', () => {
        var sandbox: sinon.SinonSandbox;
        beforeEach(function() {
            sandbox = sinon.createSandbox();
        });

        afterEach(function() {
            sandbox.restore();
        });

        it('should upload query result stream data to S3', async () => {

            process.env.ORACLE_ENDPOINT = "something";
            let executeFunc = async function(query, binds, options) {
                return Promise.resolve({ rows: [{ col1: "value", "col2": "value"}] });
            };
            let closeFunc = async function() {
                return Promise.resolve();
            }
            let executeSpy = sandbox.spy(executeFunc);
            let closeSpy = sandbox.spy(closeFunc);

            let getConnectionStub = sandbox.stub(oracledb, "getConnection").returns({ execute: executeSpy, close: closeSpy });

            let logger: Logger = container.get<Logger>(TYPES.Logger);
            let oracleReader: OracleReader = new OracleReader(logger);

            let readable: Readable = await oracleReader.read();

            expect(getConnectionStub.calledOnce).to.be.true;
            expect(executeSpy.calledOnce).to.be.true;
            expect(closeSpy.calledOnce).to.be.true;
            expect(readable).to.be.not.null;

            let chunk;
            let output = "";
            while ((chunk = readable.read()) !== null) {
                output += chunk.toString();
            }

            expect(output).to.eq('{"col1":"value","col2":"value"}\n');

            delete process.env.ORACLE_ENDPOINT;
        });

        it('should upload test stream data to S3', async () => {
            let executeFunc = async function(query, binds, options) {
                return Promise.resolve({ rows: [{ col1: "value", "col2": "value"}] });
            };
            let executeSpy = sandbox.spy(executeFunc);

            let stub = sandbox.stub(oracledb, "getConnection").returns({ execute: executeSpy});
            let logger: Logger = container.get<Logger>(TYPES.Logger);
            let oracleReader: OracleReader = new OracleReader(logger);

            let readable: Readable = await oracleReader.read();

            expect(executeSpy.calledOnce).to.be.false;
            expect(stub.calledOnce).to.be.false;
            expect(readable).to.be.not.null;

            let chunk;
            let output = "";
            while ((chunk = readable.read()) !== null) {
                output += chunk.toString();
            }

            expect(output).to.eq("this is a test stream");
        });
    });
});
