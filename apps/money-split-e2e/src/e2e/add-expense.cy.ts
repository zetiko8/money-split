import { MNamespace, Owner } from "@angular-monorepo/entities";
import { prepareNamespace } from "../support/prepare";
import { NAMESPACE_SCREEN, RECORD_FORM, RECORD_LIST } from "../support/app.po";
import * as moment from 'moment';

describe('Add expense', () => {

    describe('add an expense',() => {
        let owner!: Owner;
        let namespace!: MNamespace;

        const scenario = prepareNamespace(
            'testnamespace',
            {  username: 'testuser'},
            [
                {  username: 'atestuser1'},
                {  username: 'btestuser2'},
                {  username: 'ctestuser3'},
            ]    
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

        it('can add an expense', () => {
    
            NAMESPACE_SCREEN.visit(owner.key, namespace.id);
            NAMESPACE_SCREEN.goToAddRecord();
            RECORD_FORM.setCurrency('SIT');
            RECORD_FORM.setCost('5.4');
            RECORD_FORM.clickBenefitor('atestuser1');
            RECORD_FORM.clickBenefitor('btestuser2');
            RECORD_FORM.clickBenefitor('ctestuser3');
            RECORD_FORM.clickPaidBy('testuser');
            RECORD_FORM.confirm();
            
            RECORD_LIST.shouldHaveNumberOfRecords(1);
            RECORD_LIST.RECORD(0)
                .shouldHaveNumberOfPayers(1);
            RECORD_LIST.RECORD(0).PAYER(0)
                .hasId('payer-avatar-testuser');
            RECORD_LIST.RECORD(0).shouldHaveCost('5.4');
            RECORD_LIST.RECORD(0).shouldHaveCurrency('SIT');
            RECORD_LIST.RECORD(0)
                .shouldHaveNumberOfBenefitors(3);
            RECORD_LIST.RECORD(0).BENEFITOR(0)
                .hasId('benefitor-avatar-atestuser1');
            RECORD_LIST.RECORD(0).BENEFITOR(1)
                .hasId('benefitor-avatar-btestuser2');
            RECORD_LIST.RECORD(0).BENEFITOR(2)
                .hasId('benefitor-avatar-ctestuser3');
        });
    });

    describe('add a second expense',() => {
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
            [
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
                        created: moment().subtract(2, 'hours').toDate(),
                        edited: moment().subtract(2, 'hours').toDate(),
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

        it('can add an expense', () => {
    
            NAMESPACE_SCREEN.visit(owner.key, namespace.id);
            NAMESPACE_SCREEN.goToAddRecord();
            RECORD_FORM.setCurrency('SIT');
            RECORD_FORM.setCost('10');
            RECORD_FORM.clickBenefitor('atestuser1');
            RECORD_FORM.clickBenefitor('btestuser2');
            RECORD_FORM.clickBenefitor('ctestuser3');
            RECORD_FORM.clickPaidBy('testuser');
            RECORD_FORM.confirm();            
            RECORD_LIST.RECORD(0).shouldHaveCost('10');
            RECORD_LIST.RECORD(1).shouldHaveCost('5.4');
        });
    });

});