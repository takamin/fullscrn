"use strict";
const assert = require("chai").assert;
const Fullscrn = require("../index.js");
const initialFullscrnEnabled = Fullscrn.enabled;
const initialDocumentFullscrnEnabled = document.fullscreenEnabled;
const btnContinue = document.querySelector("#btnContinue");
const waitButtonClick = (caption, onclick) => {
    return new Promise(resolve => {
        const onClickWrapper = () => {
            btnContinue.removeEventListener("click", onClickWrapper);
            btnContinue.setAttribute("disabled", "disabled");
            resolve(onclick());
        };
        btnContinue.innerHTML = caption;
        btnContinue.addEventListener("click", onClickWrapper);
        btnContinue.removeAttribute("disabled");
    });
};
describe("Fullscrn", () => {
    describe(".enabled", ()=>{
        it("should be true after module loaded(assume testing in modern browser)", () => {
            assert.isTrue(initialFullscrnEnabled);
        });
    });
    describe(".element", () => {
        it("should be null after initialized", () => {
            assert.isNull(Fullscrn.element);
        });
    });
    describe(".request", () => {
        it("should set Fullscrn.element to the requested element", async () => {
            const request = await waitButtonClick(
                "Click to request fullscreen this button",
                () => Fullscrn.request(btnContinue));
            await request;
            assert.equal(Fullscrn.element.id, "btnContinue");
        }).timeout(0);
    });
    describe(".exit", () => {
        it("should set Fullscrn.element to null", async () => {
            const request = await waitButtonClick(
                "Click to exit fullscreen",
                () => Fullscrn.exit());
            await request;
            assert.equal(Fullscrn.element, null);
        }).timeout(0);
    });
    describe("DOM injection", () => {
        describe("Document#fullscreenEnabled", ()=>{
            it("should be true after module loaded(assume testing in modern browser)", () => {
                assert.isTrue(initialDocumentFullscrnEnabled);
            });
        });
        describe("Document#fullscreenElement", ()=>{
            it("should set document.fuscreenElement to the requested element", async () => {
                const request = await waitButtonClick(
                    "Click to request fullscreen this button",
                    () => Fullscrn.request(btnContinue));
                await request;
                assert.equal(document.fullscreenElement.id, "btnContinue");
            }).timeout(0);
            it("should set document.fuscreenElement to null", async () => {
                const request = await waitButtonClick(
                    "Click to exit fullscreen",
                    () => Fullscrn.exit());
                await request;
                assert.equal(document.fullscreenElement, null);
            }).timeout(0);
        });
        describe("Document#fullscreen", ()=>{
            it("should set document.fuscreenElement to the requested element", async () => {
                const request = await waitButtonClick(
                    "Click to request fullscreen this button",
                    () => btnContinue.requestFullscreen());
                await request;
                assert.isTrue(document.fullscreen);
            }).timeout(0);
            it("should set document.fullscreenElement to null", async () => {
                const request = await waitButtonClick(
                    "Click to exit fullscreen",
                    () => document.exitFullscreen());
                await request;
                assert.isFalse(document.fullscreen);
            }).timeout(0);
        });
        describe("Element#requestFullscreen", ()=>{
            it("should set document.fuscreenElement to the requested element", async () => {
                const request = await waitButtonClick(
                    "Click to request fullscreen this button",
                    () => btnContinue.requestFullscreen());
                await request;
                assert.equal(document.fullscreenElement.id, "btnContinue");
            }).timeout(0);
        });
        describe("Document#exitFullscreen", ()=>{
            it("should set document.fullscreenElement to null", async () => {
                const request = await waitButtonClick(
                    "Click to exit fullscreen",
                    () => document.exitFullscreen());
                await request;
                assert.equal(document.fullscreenElement, null);
            }).timeout(0);
        });
    });
});