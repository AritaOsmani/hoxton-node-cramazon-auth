import { Prisma, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({ log: ['query', 'error'] })
import bcrypt from 'bcryptjs'

const items: Prisma.ItemsCreateInput[] = [
    {
        title: 'Relaxed Fit T-shirt',
        image: 'https://lp2.hm.com/hmgoepprod?set=quality%5B79%5D%2Csource%5B%2F1e%2F86%2F1e86c77fb86afc19daad9acb5b39470e7bc5ca1f.jpg%5D%2Corigin%5Bdam%5D%2Ccategory%5Bmen_tshirtstanks_shortsleeve%5D%2Ctype%5BDESCRIPTIVESTILLLIFE%5D%2Cres%5Bm%5D%2Chmver%5B2%5D&call=url[file:/product/main]',
        price: 12.99,
        stock: 20
    },
    {
        title: 'Watch',
        image: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/A_popular_model_of_ELLIOT_FRANZ%C3%89N.jpg',
        price: 120.95,
        stock: 50
    },
    {
        title: 'Medium shopper bag',
        image: 'https://www.armani.com/variants/images/25185454456169905/D/w400.jpg',
        price: 30,
        stock: 60
    },
    {
        title: 'Summer dress',
        image: 'https://www.collinsdictionary.com/images/full/dress_31690953_1000.jpg',
        price: 15.25,
        stock: 80
    },
    {
        title: 'Black pants',
        image: 'https://media.gq.com/photos/5d1a2c8185896900081d0462/master/w_2000,h_1333,c_limit/GQ-black-pants-stella-3x2.jpg',
        price: 12.39,
        stock: 100
    },
    {
        title: 'Light grey scarf',
        image: 'https://lp2.hm.com/hmgoepprod?set=quality%5B79%5D%2Csource%5B%2Fdb%2F6c%2Fdb6c6cbcf203b88dcc55acbb42ef3d1089f21326.jpg%5D%2Corigin%5Bdam%5D%2Ccategory%5B%5D%2Ctype%5BDESCRIPTIVESTILLLIFE%5D%2Cres%5Bm%5D%2Chmver%5B2%5D&call=url[file:/product/main]',
        price: 9.47,
        stock: 20
    }
]

const users: Prisma.UsersCreateInput[] = [
    {
        email: 'arita@email.com',
        name: 'Arita',
        password: bcrypt.hashSync('arita', 8),
        basket: {
            create: [
                {
                    quantity: 5,
                    item: {
                        connect: {
                            title: 'Relaxed Fit T-shirt'
                        }
                    }
                },
                {
                    quantity: 1,
                    item: {
                        connect: {
                            title: 'Watch'
                        }
                    }
                }
            ]
        }
    },
    {
        email: 'nicolas@email.com',
        name: 'Nicolas',
        password: bcrypt.hashSync('nicolas', 8),
        basket: {
            create: [
                {
                    quantity: 3,
                    item: {
                        connect: {
                            title: 'Medium shopper bag'
                        }
                    }
                },
                {
                    quantity: 6,
                    item: {
                        connect: {
                            title: 'Black pants'
                        }
                    }
                }
            ]
        }

    },
    {
        email: 'ed@email.com',
        name: 'Ed',
        password: bcrypt.hashSync('ed', 8),
        basket: {
            create: [
                {
                    quantity: 2,
                    item: {
                        connect: {
                            title: 'Light grey scarf'
                        },

                    }
                },
                {
                    quantity: 1,
                    item: {
                        connect: {
                            title: 'Watch'
                        }
                    }
                }
            ]
        }
    },
    {
        email: 'artiola@email.com',
        name: 'Artiola',
        password: bcrypt.hashSync('artiola', 8),
        basket: {
            create: [
                {
                    quantity: 3,
                    item: {
                        connect: {
                            title: 'Summer dress'
                        }
                    }
                },
                {
                    quantity: 1,
                    item: {
                        connect: {
                            title: 'Relaxed Fit T-shirt'
                        }
                    }
                }
            ]
        }
    }
]

async function createStuff() {
    for (const item of items) {
        await prisma.items.create({ data: item })
    }

    for (const user of users) {
        await prisma.users.create({ data: user })
    }
}

createStuff()