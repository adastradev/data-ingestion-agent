
import "reflect-metadata";
import * as chai from 'chai';
import * as AWS from "aws-sdk-mock";

import S3Writer from "../../source/DataAccess/S3/S3Writer";
import { Readable } from "stream";

const expect = chai.expect;

describe('S3Writer', () => {

    describe('when ingesting data', () => {

        it('should upload data to S3', async () => {
            var s3Config = { region: "us-east-1" };
            var s3Writer = new S3Writer(s3Config, "some_tenant_id", "some_bucket");
            var uploadCalls = 0;
            AWS.mock("S3", "upload", (params, callback) => {
                uploadCalls++;
                expect(params.Bucket).to.eq("some_bucket/some_tenant_id");
                expect(params.Key).to.contain("testUpload-");
                expect(params.Body).to.be.instanceof(Readable);
                callback(null, 'success');
            });

            var stream: Readable = new Readable();
            stream.push("test");
            stream.push(null);
            await s3Writer.ingest(stream);

            AWS.restore("S3", "upload");

            expect(uploadCalls).to.eq(1);
        });
    });
});
