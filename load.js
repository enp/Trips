#!/usr/bin/env node

const fs   = require('fs'),
      es   = require('elasticsearch'),
      argv = require('yargs').argv

const elastic = es.Client({ host: argv.url, log: 'debug' })

const index_name = argv.index

async function load() {

    try {

        if (await elastic.indices.exists({ index : index_name }))
            await elastic.indices.delete({ index : index_name })
            
        await elastic.indices.create({
            index : index_name,
            body  : {
                settings : {
                    number_of_shards : 4,
                    number_of_replicas : 0
                }
            }
        })

        const bulk = []

        const files = fs.readdirSync('.')
        for (const file of files) {
            if (!file.startsWith('.') && file != 'node_modules' && fs.lstatSync(file).isDirectory()) {
                const trip = JSON.parse(fs.readFileSync(`${file}/metadata.json`, 'utf8'))
                trip.text = fs.readFileSync(`${file}/readme.md`, 'utf8')
                bulk.push({ index:  { _index: index_name, _type: 'trip', _id : file } })
                bulk.push(trip)
            }
        }
        
        if (bulk.length > 0)
            await elastic.bulk({ body : bulk })
    
    } catch (error) {
        console.log(error.stack)
    }
}

load()
