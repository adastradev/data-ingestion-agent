
import 'reflect-metadata';
import * as chai from 'chai';

import GZipOutputEncoder from '../../source/DataAccess/GZipOutputEncoder';
import { Readable } from 'stream';

const expect = chai.expect;

describe('GZipOutputEncoder', () => {
    describe('encode', () => {
        it('should return a readable stream and appropriate GZip extension', async () => {
            const icf = new GZipOutputEncoder();

            // create input stream
            const readable = new Readable();
            readable.push('test');
            const result = icf.encode(readable);
            readable.push(null);

            expect(result.extension).to.eq('gz');
        });
    });
});
