import React from 'react';
import logo from '../assets/img/logo.png';
import ToggleDisplay from 'react-toggle-display';
import $ from 'jquery';

export default React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },
  getInitialState() {
    return( { searched: false, suggestionText: 0} )
  },
  handleSubmit(event) {
    event.preventDefault();
    if (this.state.suggestionText === 0) {
      
      $('#formFade').animate({
        bottom: 20,
        opacity: 0,
      }, 750, () => {
        this.setState({
          searchString: $('#search').val(),
          suggestionText: 1,
          inputText: ''
        });
        $('#search').val('')
        $('#formFade').css('bottom', '-29px')
      }).animate({
        bottom: 0,
        opacity: 1
      }, 750)
    } else {
      this.setState({ 
        searched: true,
        vidString: $('#search').val()
      })
      let query = { vidString: $('#search').val(), searchString: this.state.searchString }
      this.context.router.push({ pathname: '/results', query});
    }
  },
  render() {
    return (
  <div id="wrapper">
    <div id="hero">
      <div className="header">
        <div><img className="heroimg" src={logo} alt="Relaudio"></img></div>
          <div className="row" style={{ marginLeft: 0, marginRight: 0 }}>
            <form id="formFade" className="col-md-8 col-md-offset-2">
            <div className="col-md-9" style={{ paddingBottom: '20px' }}>
              <input onChange={ (e) => this.setState({ inputText: e.target.value }) } placeholder={this.state.suggestionText === 0 ?  'What quote are you looking for?' : 'What video/video link are you looking for?'} id="search" style={{ border: '1px solid #1200E7', height: 41, width: '100%', fontSize: 18, paddingLeft: 10, marginRight: 40}} />
            </div>
            <div className="col-md-3">
              <button id="submitButton"type="submit" onClick={this.handleSubmit} style={{ position: 'relative', backgroundColor: '#1200E7', border: 'none', fontSize:'18', textAlign: 'center', color: 'white', height: 41, width: '100%' }}>
                { this.state.suggestionText === 0 ? 'Next' : (!this.state.inputText ? 'Not Sure?' : 'Find') }
              </button>
            </div>
            </form>
          </div>
      </div>
    </div>
  </div> 
    )
  }
})
