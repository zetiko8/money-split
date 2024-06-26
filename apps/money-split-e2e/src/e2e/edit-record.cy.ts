import { MNamespace, Owner } from "@angular-monorepo/entities";
import { prepareNamespace } from "../support/prepare";
import { NAMESPACE_SCREEN, RECORD_FORM, RECORD_LIST } from "../support/app.po";
import * as moment from 'moment';

describe('Add expense', () => {

    describe('edit a record',() => {
        let owner!: Owner;
        let namespace!: MNamespace;

        const firstDate = moment().set({
            year: 2024,
            month: 2,
            date: 15,
        }).toDate();

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
            RECORD_LIST.RECORD(0).goToEdit();
            RECORD_FORM.currencyIsSetTo('SIT');
            RECORD_FORM.costIsSetTo('4');
            RECORD_FORM.BENEFITORS.areSelected([
                'atestuser1',
                'btestuser2',
                'ctestuser3',
            ]);
            RECORD_FORM.BENEFITORS.areNotSelected([
                'testuser',
            ]);
            RECORD_FORM.PAID_BY.areSelected([
                'testuser',
            ]);
            RECORD_FORM.PAID_BY.areNotSelected([
                'atestuser1',
                'btestuser2',
                'ctestuser3',
            ]);
            RECORD_FORM.setCurrency('EUR');
            RECORD_FORM.setCost('10');
            RECORD_FORM.clickBenefitor('atestuser1');
            RECORD_FORM.clickBenefitor('btestuser2');
            RECORD_FORM.clickBenefitor('ctestuser3');
            RECORD_FORM.clickBenefitor('testuser');
            RECORD_FORM.clickPaidBy('testuser');
            RECORD_FORM.clickPaidBy('atestuser1');
            RECORD_FORM.confirm();
            
            RECORD_LIST.shouldHaveNumberOfRecords(1);
            RECORD_LIST.RECORD(0)
                .shouldHaveNumberOfPayers(1);
            RECORD_LIST.RECORD(0).PAYER(0)
                .hasId('payer-avatar-atestuser1');
            RECORD_LIST.RECORD(0).shouldHaveCost('10');
            RECORD_LIST.RECORD(0).shouldHaveCurrency('EUR');
            RECORD_LIST.RECORD(0)
                .shouldHaveNumberOfBenefitors(1);
            RECORD_LIST.RECORD(0).BENEFITOR(0)
                .hasId('benefitor-avatar-testuser');
        });
    });
});