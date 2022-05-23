
describe('Test with backend', () => {

    beforeEach('login to the app', () => {
        cy.server()
        cy.route('GET', '**/tags', 'fixture:tags.json')
        cy.loginToApplication()
    })

    it.skip('verify correct request and response', () => {
        
        cy.server()
        cy.route('POST', '**/articles').as('postArticles')

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('Title12')
        cy.get('[formcontrolname="description"]').type('Description')
        cy.get('[formcontrolname="body"]').type('Body')
        cy.contains('Publish Article').click()


        cy.wait('@postArticles')
        cy.get('@postArticles').then( xhr => {
            console.log(xhr);
            expect(xhr.status).to.equal(200)
            expect(xhr.request.body.article.body).to.equal("Body")
            expect(xhr.response.body.article.description).to.equal('Description')
        })
    })

    it.skip('should gave tags with routing object', () => {
        cy.get('.tag-list')
        .should('contain', 'cypress')
        .and('contain', 'automation')
        .and('contain', 'testing')
    })


    it('verify global feed likes count', () => {
        cy.route('GET', '**/articles/feed*', '{"articles":[],"articlesCount":0}')
        cy.route('GET', '**/articles*', 'fixture:articles.json')
    
        cy.contains('Global Feed').click()
        cy.get('app-article-list button').then(listOfbuttons => {
            expect(listOfbuttons[0]).to.contain('1')
            expect(listOfbuttons[1]).to.contain('5')
        })

        cy.fixture('articles').then(file => {
            const articleLink = file.articles[1].slug
            cy.route('POST', '**/articles/' + articleLink + '/favorite', file)
        })

        cy.get('app-article-list button').eq(1).click().should('contain', '6')
    })


    //cypress6
    it.skip('intercepting and modifying the request and response', () => {

        //cy.intercept('POST', '**/articles', (req) => {
        //     req.body.article.description = 'This is a description 2'
        // }).as('postArticles')
    
        cy.intercept('POST', '**/articles', (req) => {
            req.reply(res => {
                expect(res.body.article.description).to.equal('This is a description')
                res.body.article.description = "This is a description 2"
            })
        }).as('postArticles')

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('This is a title')
        cy.get('[formcontrolname="description"]').type('This is a description')
        cy.get('[formcontrolname="body"]').type('This is a body of the Article')
        cy.contains('Publish Article').click()

        cy.wait('@postArticles')
        cy.get('@postArticles').then( xhr => {
            console.log(xhr);
            expect(xhr.status).to.equal(200)
            expect(xhr.request.body.article.body).to.equal("This is a body of the Article")
            expect(xhr.response.body.article.description).to.equal('This is a description 2')
        })
    })

///1111
    // it.only('delete a new article in a global feed', () => {

    //     const userCredentials = {
    //         "user": {
    //             "email": "artem.bondar16@gmail.com",
    //             "password": "CypressTest1"
    //         }
    //     } 

    //     const bodyRequest ={
    //         "article": {
    //             "tagList": [],
    //             "title": "ps11609",
    //             "description": "hoang111",
    //             "body": "hoang111"
    //         }
    //     }

    //     cy.request('POST', 'https://conduit.productionready.io/api/users/login', userCredentials)
    //         .its('body').then(body => {
    //             const token = body.user.token
                
    //             cy.request({
    //                 url: 'https://conduit.productionready.io/api/articles/',
    //                 headers: {'Authorization': 'Token ' + token},
    //                 method: 'POST',
    //                 body: bodyRequest
    //             }).then(response => {
    //                 expect(response.status).to.equal(200)
    //             })

    //             cy.contains('Global Feed').click()
    //             cy.get('.article-preview').first().click()
    //             cy.get('.article-actions').contains('Delete Article').click()
            
    //             cy.request({
    //                 url: 'https://api.realworld.io/api/articles?limit=10&offset=0',
    //                 headers: {'Authorization': 'Token ' + token},
    //                 method: 'GET'
    //             }).its('body').then(body => {
    //                 expect(body.articles[0].title).not.to.equal('ps11609')
    //             })
            
    //         })
    // })


    //222
    it.only('delete a new article in a global feed', () => {

        const bodyRequest ={
            "article": {
                "tagList": [],
                "title": "ps11609",
                "description": "hoang111",
                "body": "hoang111"
            }
        }

        cy.get('@token').then(token => {
                cy.request({
                    url: 'https://conduit.productionready.io/api/articles/',
                    headers: {'Authorization': 'Token ' + token},
                    method: 'POST',
                    body: bodyRequest
                }).then(response => {
                    expect(response.status).to.equal(200)
                })

                cy.contains('Global Feed').click()
                cy.get('.article-preview').first().click()
                cy.get('.article-actions').contains('Delete Article').click()
            
                cy.request({
                    url: 'https://api.realworld.io/api/articles?limit=10&offset=0',
                    headers: {'Authorization': 'Token ' + token},
                    method: 'GET'
                }).its('body').then(body => {
                    expect(body.articles[0].title).not.to.equal('ps11609')
                })
            
            })
    })
})