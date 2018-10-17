
import 'reflect-metadata';
import * as chai from 'chai';

import SendDataMessage from '../../source/Messages/SendDataMessage';

const expect = chai.expect;

describe('SendDataMessage', () => {

    const validMessageWithHandle = new SendDataMessage();
    validMessageWithHandle.payload = {};
    validMessageWithHandle.receiptHandle = '1234';

    const validMessageNoHandle = new SendDataMessage();
    validMessageNoHandle.payload = {};

    const validMessageNoPayload = new SendDataMessage();
    validMessageNoPayload.receiptHandle = '1234';

    const validMessageDefault = new SendDataMessage();

    describe('when creating a new message instance', () => {

        it('should return a properly configured message', () => {
            const message = SendDataMessage.create({}, '1234');
            expect(message).to.deep.eq(validMessageWithHandle);
        });

        it('should return a properly configured message when no receipt handle is specified', () => {
            const message = SendDataMessage.create({});
            expect(message).to.deep.eq(validMessageNoHandle);
        });

        it('should return a properly configured message when receipt handle is specified as null', () => {
            const message = SendDataMessage.create({}, null);
            expect(message).to.deep.eq(validMessageNoHandle);
        });

        it('should return a properly configured message when receipt handle is specified as an empty string', () => {
            const message = SendDataMessage.create({}, null);
            expect(message).to.deep.eq(validMessageNoHandle);
        });

        it('should return a properly configured message when payload is an empty object', () => {
            const message = SendDataMessage.create({}, '1234');
            expect(message).to.deep.eq(validMessageNoPayload);
        });

        it('should return a properly configured message when payload is specified as null', () => {
            const message = SendDataMessage.create(null, '1234');
            expect(message).to.deep.eq(validMessageNoPayload);
        });

        it('should return a properly configured message when neither payload or receipt handle is specified', () => {
            const message = SendDataMessage.create();
            expect(message).to.deep.eq(validMessageDefault);
        });
    });

    describe('when converting an existing message to JSON', () => {
        it('should return a valid JSON value', () => {
            const message = SendDataMessage.create({}, '1234');
            const json = message.toJson();
            const deserializedMessage = JSON.parse(json) as SendDataMessage;
            expect(deserializedMessage).to.deep.eq(validMessageWithHandle);
        });

        it('should return a valid JSON value when no receipt handle is specified', () => {
            const message = SendDataMessage.create({});
            const json = message.toJson();
            const deserializedMessage = JSON.parse(json) as SendDataMessage;
            expect(deserializedMessage).to.deep.eq(validMessageNoHandle);
        });

        it('should return a valid JSON value when no payload is specified', () => {
            const message = SendDataMessage.create(null, '1234');
            const json = message.toJson();
            const deserializedMessage = JSON.parse(json) as SendDataMessage;
            expect(deserializedMessage).to.deep.eq(validMessageNoPayload);
        });

        it('should return a valid JSON value when neither payload or receipt handle is specified', () => {
            const message = SendDataMessage.create();
            const json = message.toJson();
            const deserializedMessage = JSON.parse(json) as SendDataMessage;
            expect(deserializedMessage).to.deep.eq(validMessageDefault);
        });
    });
});
