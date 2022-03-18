import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const app = express()
app.use(cors())
app.use(express.json())
const prisma = new PrismaClient({ log: ['error', 'query', 'warn', 'info'] })
const PORT = 4000;

function generateToken(id: Number) {
    //@ts-ignore
    const token = jwt.sign({ id: id }, process.env.SECRET, { expiresIn: '1day' })
    return token
}

async function getUserFromToken(token: string | undefined) {
    //@ts-ignore
    const userId = jwt.verify(token, process.env.SECRET)
    //@ts-ignore
    const user = await prisma.users.findUnique({ where: { id: userId.id } })
    return user;
}

app.post('/signup', async (req, res) => {
    const { email, name, password } = req.body
    try {
        const hash = bcrypt.hashSync(password, 8)
        const newUser = await prisma.users.create({ data: { email, name, password: hash } })
        const token = generateToken(newUser.id)

        res.status(200).send({ user: newUser, token: token })

    } catch (err) {
        //@ts-ignore
        res.status(400).send({ error: err.message })
    }
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await prisma.users.findUnique({ where: { email } })
        if (!user) return res.status(404).send({ error: 'User not found!' })
        const passwordMatches = bcrypt.compareSync(password, user.password)
        if (passwordMatches) {
            const token = generateToken(user.id)
            res.status(200).send({ user, token })
        } else {
            throw Error('User/password invalid')
        }

    } catch (err) {
        //@ts-ignore
        res.status(400).send({ error: err.message })
    }
})

app.get('/validate', async (req, res) => {
    const token = req.headers.authorization
    try {
        const user = await getUserFromToken(token)
        if (user) {
            return res.status(200).send(user)
        } else {
            throw Error('Invalid token')
        }

    } catch (err) {
        //@ts-ignore
        res.status(400).send({ error: err.message })
    }
})

app.get('/items', async (req, res) => {
    const items = await prisma.items.findMany()
    res.status(200).send(items)
})

app.post('/addToBasket', async (req, res) => {
    const token = req.headers.authorization
    const { title, quantity } = req.body
    try {
        const user = await getUserFromToken(token)
        const itemFound = await prisma.items.findUnique({ where: { title } })

        if (user && itemFound) {
            const getCurrentQuantity = itemFound.stock
            if (quantity > getCurrentQuantity || quantity < 0) {
                res.status(400).send({ error: 'Not so many items available or invalid quantity input' })
            } else {
                const itemAlreadyInBasket = await prisma.baskets.findFirst({ where: { itemsId: itemFound.id, usersId: user.id } })
                if (itemAlreadyInBasket) return res.status(400).send({ error: 'Already in basket!' })
                const newItemAdded = await prisma.baskets.create({
                    data: {
                        itemsId: itemFound.id,
                        quantity: quantity,
                        usersId: user.id
                    }
                })
                res.status(200).send(newItemAdded)
            }
        } else {
            res.status(404).send({ err: 'User or item not found!' })
        }


    } catch (err) {
        //@ts-ignore
        res.status(400).send({ error: err.message })
    }
})

app.post('/order', async (req, res) => {
    const token = req.headers.authorization
    const { basket } = req.body

    try {
        const user = await getUserFromToken(token)
        if (user) {


            for (const item of basket) {
                if (item.usersId !== user.id) {
                    res.send({ err: 'This basket does not belong to this user!' })
                    break
                }
                await prisma.orders.create({ data: item })
                //@ts-ignore
                const itemMatch = await prisma.items.findUnique({ where: { id: item.itemsId } })
                //@ts-ignore
                const newQuantity = itemMatch.stock - item.quantity
                const updated = await prisma.items.update({
                    where: {
                        //@ts-ignore
                        id: itemMatch.id,
                    },
                    data: {
                        stock: newQuantity
                    }
                })
            }
            const deleteBasket = await prisma.baskets.deleteMany({ where: { usersId: user.id } })

            const orders = await prisma.orders.findMany({ where: { usersId: user.id } })
            res.send(orders)
        }

    } catch (err) {
        //@ts-ignore
        res.status(400).send({ error: err.message })
    }
})

app.get('/basket', async (req, res) => {
    const token = req.headers.authorization;
    try {
        const user = await getUserFromToken(token)
        if (user) {
            const basket = await prisma.baskets.findMany({ where: { usersId: user.id }, include: { item: true } })
            res.status(200).send(basket)
        } else {
            throw Error('User not found with this token! ')
        }

    } catch (err) {
        //@ts-ignore
        res.status(400).send({ error: err.message })
    }
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
