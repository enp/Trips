class HitItem extends React.Component {
  render() {
    const blocks = this.props.bemBlocks
    const result = this.props.result
    const name = result._source.title
    return (
      <div className={blocks.item().mix(blocks.container("item"))}>
        <a href={"https://github.com/enp/trips/blob/master/"+result._id} target="_blank">
          <img alt={name} title={name} src={"https://raw.githubusercontent.com/enp/trips/master/"+result._id+"/"+result._source.image} width="200" height="200"/>
        </a>
        <label>{name}</label>
      </div>
    )
  }
}

class App extends React.Component {
  render() {
    const searchkit = new Searchkit.SearchkitManager(url+"trips")
    // our searchkit version works good with elasticsearch 5.x only, so we need to adjust queries for new versions
    searchkit.setQueryProcessor(source => {
      if (source.query && source.query.simple_query_string && source.query.simple_query_string.fields) {
        delete source.query.simple_query_string.fields
      }
      if (source.aggs) {
        for (const  [key, value] of Object.entries(source.aggs)) {
          if (value.filter) {
            value.filter = { match_all: {}}
          }
        }
      }
      console.log(source)
      return source
    })
    const filters = (
      <SideBar>
        <RefinementListFilter id="region" title="Regions" field="region.keyword" size={8}/>
        <RefinementListFilter id="keywords" title="Keywords" field="keywords.keyword" size={8}/>
      </SideBar>
    )
    return (
      <Searchkit.SearchkitProvider searchkit={searchkit}>
        <Layout size="l">
          <TopBar>
            <SearchBox/>
          </TopBar>
          <LayoutBody>
          {filters}
          <LayoutResults>
              <Hits hitsPerPage={15} mod="sk-hits-grid" itemComponent={HitItem}/>
              <Pagination showNumbers={true}/>
            </LayoutResults>
          </LayoutBody>
        </Layout>
      </Searchkit.SearchkitProvider>
    )
  }
}

ReactDOM.render(<App/>, document.getElementById('root'))
