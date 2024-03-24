import { MNamespace, Owner } from "@angular-monorepo/entities";
import { prepareNamespace } from "../support/prepare";
import { NAMESPACE_SCREEN, RECORD_LIST, SETTLE_PREVIEW_SCREEN } from "../support/app.po";
import * as moment from 'moment';
import { ACTIONS } from "../support/actions";

describe('Settle', () => {

    describe('settle button is not displayed when there are no records',() => {
        let owner!: Owner;
        let namespace!: MNamespace;

        const scenario = prepareNamespace(
            'testnamespace',
            {  username: 'testuser'},
            [
                {  username: 'atestuser1'},
                {  username: 'btestuser2'},
                {  username: 'ctestuser3'},
            ],
            [],
        );

        before(() => {
            scenario.before()
                .then(data => {
                    owner = data.owner;
                    namespace = data.namespace;
                });
        });

        after(() => {
            scenario.after();
        });

        it('settle button is not visible', () => {
            NAMESPACE_SCREEN.visit(owner.key, namespace.id);
            NAMESPACE_SCREEN.openRecordsListTab();
            RECORD_LIST.settleButton.isNotVisible();
        });
    });

    describe('settle button is not displayed all the records are settled',() => {
        let owner!: Owner;
        let namespace!: MNamespace;

        const firstDate = moment().set({
            year: 2024,
            month: 2,
            day: 15,
        }).toDate();
        const secondDate = moment(firstDate)
            .subtract(2, 'hours').toDate();
        const thirdDate = moment(firstDate)
            .subtract(1, 'day').toDate();
        const fourthDate = moment(firstDate)
            .subtract(2, 'day').toDate();

        const scenario = prepareNamespace(
            'testnamespace',
            {  username: 'testuser'},
            [
                {  username: 'atestuser1'},
                {  username: 'btestuser2'},
                {  username: 'ctestuser3'},
            ],
            [
                {
                    user: 'testuser',
                    record: {
                        benefitors: [
                            'atestuser1',
                            'btestuser2',
                            'ctestuser3',
                        ],
                        cost: 4,
                        currency: 'SIT',
                        paidBy: ['testuser'],
                        created: firstDate,
                        edited: firstDate,
                    },
                },
                {
                    user: 'testuser',
                    record: {
                        benefitors: [
                            'atestuser1',
                            'btestuser2',
                            'ctestuser3',
                        ],
                        cost: 10,
                        currency: 'SIT',
                        paidBy: ['testuser'],
                        created: secondDate,
                        edited: secondDate,
                    },
                },
                {
                    user: 'testuser',
                    record: {
                        benefitors: [
                            'atestuser1',
                            'btestuser2',
                            'ctestuser3',
                        ],
                        cost: 5.4,
                        currency: 'SIT',
                        paidBy: ['testuser'],
                        created: thirdDate,
                        edited: thirdDate,
                    },
                },
                {
                    user: 'testuser',
                    record: {
                        benefitors: [
                            'atestuser1',
                            'btestuser2',
                            'ctestuser3',
                        ],
                        cost: 3,
                        currency: 'SIT',
                        paidBy: ['testuser'],
                        created: fourthDate,
                        edited: fourthDate,
                    },
                },
            ],
        );

        before(() => {
            scenario.before()
                .then(data => {
                    owner = data.owner;
                    namespace = data.namespace;
                    ACTIONS.settleRecords(
                        namespace.name,
                        'testuser',
                        data.records.map(r => r.id),
                    );
                });
        });

        after(() => {
            scenario.after();
        });

        it('settle button is not visible', () => {
            NAMESPACE_SCREEN.visit(owner.key, namespace.id);
            NAMESPACE_SCREEN.openRecordsListTab();
            RECORD_LIST.settleButton.isNotVisible();
        });
    });

    describe('can settle',() => {
        let owner!: Owner;
        let namespace!: MNamespace;

        const firstDate = moment().set({
            year: 2024,
            month: 2,
            day: 15,
        }).toDate();
        const secondDate = moment(firstDate)
            .subtract(2, 'hours').toDate()
        const thirdDate = moment(firstDate)
            .subtract(1, 'day').toDate()
        const fourthDate = moment(firstDate)
            .subtract(2, 'day').toDate()

        const scenario = prepareNamespace(
            'testnamespace',
            {  username: 'testuser'},
            [
                {  username: 'atestuser1'},
                {  username: 'btestuser2'},
                {  username: 'ctestuser3'},
            ],
            [
                {
                    user: 'testuser',
                    record: {
                        benefitors: [
                            'atestuser1',
                            'btestuser2',
                            'ctestuser3',
                        ],
                        cost: 4,
                        currency: 'SIT',
                        paidBy: ['testuser'],
                        created: firstDate,
                        edited: firstDate,
                    },
                },
                {
                    user: 'testuser',
                    record: {
                        benefitors: [
                            'atestuser1',
                            'btestuser2',
                            'ctestuser3',
                        ],
                        cost: 10,
                        currency: 'SIT',
                        paidBy: ['testuser'],
                        created: secondDate,
                        edited: secondDate,
                    },
                },
                {
                    user: 'testuser',
                    record: {
                        benefitors: [
                            'atestuser1',
                            'btestuser2',
                            'ctestuser3',
                        ],
                        cost: 5.4,
                        currency: 'SIT',
                        paidBy: ['testuser'],
                        created: thirdDate,
                        edited: thirdDate,
                    },
                },
                {
                    user: 'testuser',
                    record: {
                        benefitors: [
                            'atestuser1',
                            'btestuser2',
                            'ctestuser3',
                        ],
                        cost: 3,
                        currency: 'SIT',
                        paidBy: ['testuser'],
                        created: fourthDate,
                        edited: fourthDate,
                    },
                },
            ],
        );

        before(() => {
            scenario.before()
                .then(data => {
                    owner = data.owner;
                    namespace = data.namespace;
                });
        });

        after(() => {
            scenario.after();
        });

        it('can settle', () => {
            NAMESPACE_SCREEN.visit(owner.key, namespace.id);
            NAMESPACE_SCREEN.openRecordsListTab();
            RECORD_LIST.settleButton.click();
            SETTLE_PREVIEW_SCREEN.settleButton.click();
            NAMESPACE_SCREEN.userIsOn(namespace.name);
        });
    });

});