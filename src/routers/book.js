const Book = require('../models/book')
const redis = require('redis')
const express = require('express')

const router = new express.Router()
const auth = require('../middleware/auth')
const port_redis =6379;
const redis_client = redis.createClient(port_redis);

router.post('/book',auth,async(req,res)=>{
    const book = new Book({
        ...req.body,
        owner:req.user._id 
    })
    try{
        await book.save()
        res.send(book)
    }catch(e){
        res.status(400).send(error)
    }
})


router.get('/books', auth,async(req,res)=>{
    try{
        const{page=1,limit=2} = req.query
        const books = await Book.find({owner:req.user._id}).limit(limit*1).skip((page-1)*limit)
        res.status(201).send(books)
    }
    catch(e){
        res.status(500).send(error)
    }
})


router.get('/book/:id', auth, async(req,res)=>{
    const _id = req.params.id
    try{
        redis_client.get(_id,async(err,recipe)=>{
            if(recipe){
               // console.log('cache'+recipe)
                return res.status(200).send(JSON.parse(recipe))
            }
            else{
                const book = await Book.findOne({_id,owner: req.user._id})

                if(!book)
                return res.status(404).send()
                redis_client.setex(_id, 6000, JSON.stringify(book));

                res.send(book)
            }
        })
        
    }
    catch(e){
        res.status(500).send()
    }
    
})



router.put('/book/:id',auth, async(req,res)=>{
    const id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'author','genre']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    console.log(isValidOperation)
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const book = await Book.findOne({_id:id, owner:req.user._id})
       // console.log(task)
        if(!book)
        return res.status(404).send()

        updates.forEach((update)=>{
            book[update] = req.body[update]
        })
        await book.save()
        res.send(book)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/book/:id',auth, async (req, res) => {
    const id = req.params.id
    try{
      const book = await Book.findOne({_id:id, owner:req.user._id})
  
        if (!book) {
            res.status(404).send()
        }

        res.send(book)
    } catch (e) {
        res.status(500).send()
    }
})
module.exports = router