
import "reflect-metadata";
import * as chai from 'chai';

import PreviewMessage from "../../source/Messages/PreviewMessage";

const expect = chai.expect;

describe('PreviewMessage', () => {

    const validMessageWithHandle = new PreviewMessage();
    validMessageWithHandle.payload = {};
    validMessageWithHandle.receiptHandle = "1234";

    const validMessageNoHandle = new PreviewMessage();
    validMessageNoHandle.payload = {};

    const validMessageNoPayload = new PreviewMessage();
    validMessageNoPayload.receiptHandle = "1234";

    const validMessageDefault = new PreviewMessage();

    describe('when creating a new message instance', () => {

        it('should return a properly configured message', () => {
            const message = PreviewMessage.create({}, "1234");
            expect(message).to.deep.eq(validMessageWithHandle);
        });

        it('should return a properly configured message when no receipt handle is specified', () => {
            const message = PreviewMessage.create({});
            expect(message).to.deep.eq(validMessageNoHandle);
        });

        it('should return a properly configured message when receipt handle is specified as null', () => {
            const message = PreviewMessage.create({}, null);
            expect(message).to.deep.eq(validMessageNoHandle);
        });

        it('should return a properly configured message when receipt handle is specified as an empty string', () => {
            const message = PreviewMessage.create({}, null);
            expect(message).to.deep.eq(validMessageNoHandle);
        });

        it('should return a properly configured message when payload is an empty object', () => {
            const message = PreviewMessage.create({}, "1234");
            expect(message).to.deep.eq(validMessageNoPayload);
        });

        it('should return a properly configured message when payload is specified as null', () => {
            const message = PreviewMessage.create(null, "1234");
            expect(message).to.deep.eq(validMessageNoPayload);
        });

        it('should return a properly configured message when neither payload or receipt handle is specified', () => {
            const message = PreviewMessage.create();
            expect(message).to.deep.eq(validMessageDefault);
        });
    });

    describe('when converting an existing message to JSON', () => {
        it('should return a valid JSON value', () => {
            const message = PreviewMessage.create({}, "1234");
            let json = message.toJson();
            let deserializedMessage = <PreviewMessage> JSON.parse(json);
            expect(deserializedMessage).to.deep.eq(validMessageWithHandle);
        });

        it('should return a valid JSON value when no receipt handle is specified', () => {
            const message = PreviewMessage.create({});
            let json = message.toJson();
            let deserializedMessage = <PreviewMessage> JSON.parse(json);
            expect(deserializedMessage).to.deep.eq(validMessageNoHandle);
        });

        it('should return a valid JSON value when no payload is specified', () => {
            const message = PreviewMessage.create(null, "1234");
            let json = message.toJson();
            let deserializedMessage = <PreviewMessage> JSON.parse(json);
            expect(deserializedMessage).to.deep.eq(validMessageNoPayload);
        });

        it('should return a valid JSON value when neither payload or receipt handle is specified', () => {
            const message = PreviewMessage.create();
            let json = message.toJson();
            let deserializedMessage = <PreviewMessage> JSON.parse(json);
            expect(deserializedMessage).to.deep.eq(validMessageDefault);
        });
    });
});
