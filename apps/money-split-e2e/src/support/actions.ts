export const ACTIONS = {
    registerOwner: (
        username: string,
        password: string,
    ) => {
        cy.request({
            url: 'http://localhost:3333/app/register',
            body: {
                username,
                password
            },
            method: 'POST'
        })
    },
    deleteOwner: (
        username: string,
    ) => {
        cy.request(
            'DELETE', 
            'http://localhost:3333/cybackdoor/owner/' + username
            ).then((response) => {
                expect(response.status).to.equal(200);
            });
    }
}