import React from 'react';
import $ from 'jquery';
import styles from '../assets/styles/style.scss';
import logo from '../assets/img/logowhite.svg';
import ResultComponent from './ResultComponent';
let xhr = null;
export default React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },
  getInitialState() {
    return (
      {
        searchString: this.props.location.query.searchString ? this.props.location.query.searchString : undefined, 
        vidString: this.props.location.query.vidString ? this.props.location.query.vidString : undefined,
        results: 'Loading...',
        sort: 'caption'
      }
    );
  },
  getVidRes(searchString, vidString='') {
    xhr = $.ajax({
      url: `http://localhost:8081/api?searchString=${searchString}&vidString=${vidString}`,
      dataType: 'json',
      type: 'POST',
      success: function(res) {
        if( res.length === 0) {
          res = 'No results with captions :('
        }
        console.log(res)
        this.setState({
          results: res
        });
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({
          results: "ERROR: \n" + status + "\n" + err.toString()
        })
      }.bind(this)
    });
  },
  componentWillMount() {
    if (typeof (this.state.searchString) === 'undefined') {
      this.setState({ results: 'No Results' });
    } else {
      this.getVidRes(this.state.searchString, this.state.vidString);
    }
    return (
      <div> {this.state.results} </div>
    );
  },
  componentWillUnmount() {
    if ( xhr != null ) {
      xhr.abort();
      xhr = null
    }
  },
  updateSearch(event) {
    let searchTerm = $("#search").val()
    let vidTerm = $('#searchvid').val()
    this.setState({ searchString: searchTerm, vidString: vidTerm, gifSrc: '' });
    console.log(searchTerm)
    if ((typeof(searchTerm) !== 'undefined' && searchTerm !== '')) {
      console.log(typeof(searchTerm))
      this.setState({ results: 'Loading...'})
      this.context.router.push({pathname: '/results', query: { searchString: this.state.searchString, vidString: this.state.vidString }})
      this.getVidRes(searchTerm, vidTerm);
    }
  },
  renderResults() {
    let res = []
    if (Array.isArray(this.state.results) === true && Array.length > 0) {
      let resComps = this.state.results
      console.log(this.state.results)
      if (this.state.sort === 'video') {
        resComps = resComps.sort( (a,b) => {
          return a.order - b.order
        })
      } else {
        resComps = resComps.sort(function(a,b) {
        let arrA = a.captions === 'true' && a.caption_match.length > 0 ? a.caption_match[0].similarity : 0
        let arrB = b.captions === 'true' && b.caption_match.length > 0 ? b.caption_match[0].similarity : 0
        return arrB - arrA
        })
      }
      resComps.map( (index, cnt) => {
        if (typeof(index) !== 'undefined') {
        res.push(<ResultComponent
          videoUrl={index.video}
          key={cnt}
          title={index.title}
          description={index.description}
          thumbnail={index.thumbnail}
          author={index.author}
          length={index.length}
          caption_match={index.caption_match}
        />);
      }
    }
    ) 
    } else if (this.state.results === 'Loading...') {
      if(this.state.gifSrc === '' || typeof(this.state.gifSrc) === 'undefined') {
        $.get('https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=loading&fmt=json&rating=y', function(res) {
        let gifSrc = res.data.image_url
        this.setState({
          gifSrc: gifSrc
        })
      }.bind(this))}
      return (<div style={{ textAlign: 'center' }}><h1>Loading...</h1><img height='300'src={this.state.gifSrc}/><br/><a href={this.state.gifSrc}>Powered By Giphy</a></div>)
    } else {
      return (<h1 style={{ textAlign: 'center' }}> {this.state.results} </h1>)
    }
    return res;
  },
  render() {
    return (
      <div style={{position: 'absolute', top: 0, left: 0, width: '100vw', backgroundColor: '#FFF' }}>
        <div className="row" key='1' style={{ paddingTop: 30, display: this.state.results === 'Loading...' ? 'none': 'block', whiteSpace: 'no-wrap', marginLeft: 0, paddingBottom: 20, float: 'left',  width: '100%', backgroundColor: '#1200E7', color: 'white', zIndex: '1000'}}>
            <div className="col-md-3" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
            <a href='/'><img src={logo} className="logo" style={{ maxWidth: 200 }}/></a>
            </div>
            <div  className="col-md-9" key='1' style={{ fontSize: 20, verticalAlign: 'middle' }}>
              <div className="row">
              <div className="col-md-4 col-md-offset-0 col-xs-10 col-xs-offset-1">
              <input 
                type="text" 
                id="searchvid"
                onChange={ (e) => this.setState({ vidString: e.target.value }) }
                value={this.state.vidString}
                style={{ 
                  outline: 'none', 
                  backgroundColor: 'transparent', 
                  color: 'white', 
                  width: '100%',
                  border: 'none', 
                  borderBottom: '1px dashed white' 
                }} 
              />
              <p style={{ fontSize: '10px', marginTop: '2px' }}><em>Video you searched for</em></p>
              </div>
              <div className="col-md-4 col-md-offset-0 col-xs-10 col-xs-offset-1">
              <input 
                type="text" 
                id="search"
                onChange={ (e) => this.setState({ searchString: e.target.value }) }
                value={this.state.searchString}
                style={{ 
                  outline: 'none', 
                  backgroundColor: 'transparent', 
                  color: 'white', 
                  width: '100%',
                  marginLeft: '10px',
                  border: 'none', 
                  borderBottom: '1px dashed white' 
                }} 
              />
              
              <p style={{ fontSize: '10px', marginTop: '2px' }}><em>...and the quote to look for in those results</em></p>
              </div>
              <div className="col-md-2 col-md-offset-0 col-xs-10 col-xs-offset-1">
                <button id="submitButton"type="submit" onClick={this.updateSearch} 
                  style={{ backgroundColor: '#1200E7', border: '1px solid white', fontSize:'18', width: '100%', textAlign: 'center', color: 'white'}}>
                  Find
                </button>
              </div>
              </div>
              <div className="row">
              <div className="col-md-4 col-md-offset-0 col-xs-10 col-xs-offset-1">
              <p style={{ display: this.state.results === 'Loading...' ? 'none': 'block', fontSize: 12 }}><b>Order By: </b>
          <span onClick={ () => {this.setState({ sort: 'video' })} } style={{ cursor: 'pointer', borderBottom: this.state.sort === 'video' ? '1px dashed #FFF' : 'none' }}>Video Relevance </span> 
          <span style={{ paddingRight: 10}}></span>
          <span onClick={ () => {this.setState({ sort: 'caption' })} } style={{ cursor: 'pointer', borderBottom: this.state.sort === 'caption' ? '1px dashed #FFF' : 'none' }}> Caption Relevance </span></p>
          </div>
</div>
            </div>
        </div>
        <div key='2' style={{ paddingTop: 10, width: '75vw', height:'100vh', margin: '0 auto', overflowY: 'scroll'}}>
          { this.renderResults() }
        </div>
      </div>
    );
  }
});
