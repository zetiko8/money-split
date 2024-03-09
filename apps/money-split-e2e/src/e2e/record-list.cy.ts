import { MNamespace, Owner } from "@angular-monorepo/entities";
import { prepareNamespace } from "../support/prepare";
import { NAMESPACE_SCREEN, RECORD_LIST } from "../support/app.po";
import * as moment from 'moment';

describe('Record list', () => {

    describe('date displaying',() => {
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

        it('are ordered by date', () => {
            NAMESPACE_SCREEN.visit(owner.key, namespace.id);
            RECORD_LIST.DATE(0).hasDate(firstDate);        
            RECORD_LIST.DATE(0).shouldHaveNumberOfRecords(2);        
            RECORD_LIST.DATE(0).RECORD(0).shouldHaveCost('4');
            RECORD_LIST.DATE(0).RECORD(1).shouldHaveCost('10');
            RECORD_LIST.DATE(1).hasDate(thirdDate);
            RECORD_LIST.DATE(1).shouldHaveNumberOfRecords(1);
            RECORD_LIST.DATE(1).RECORD(0).shouldHaveCost('5.4');
            RECORD_LIST.DATE(2).hasDate(fourthDate);
            RECORD_LIST.DATE(2).shouldHaveNumberOfRecords(1);
            RECORD_LIST.DATE(2).RECORD(0).shouldHaveCost('3');
        });
    });

});