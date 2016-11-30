import React from 'react';
import $ from 'jquery';

export default React.createClass({
  getInitialState() {
    return ({});
  },
  renderCaptionStamps(capt_match) {
    if (Array.isArray(capt_match) === true) {
    let res = []
        capt_match.map( (index, cnt) => {
          if (cnt < 2) {
        res.push(
        <div key={cnt}>
          <p style={{ fontSize: 18 }}> Topic discussed at <a style={{ fontWeight: 700, color: '#1200E7' }} href={index.link}>{index.timestamp}</a> </p>
          <div style={{ fontSize: 14, lineHeight: 1 }} dangerouslySetInnerHTML={{__html: '<em>"' + index.context + '"</em>'}}/>
        </div>
        )
      }
        })
        return res;
    } else {
      return (
        <p style={{ fontSize: 18 }}>{this.props.caption_match} </p>
      )
    }
  },
  render() {
    return (
        <div className="row" style={{ paddingBottom: 50 }} key={this.props.key}>
          <div className="col-md-3" key='1'>
            <img width='100%' style={{ marginTop: 20 }} src={this.props.thumbnail}/>
          </div>
          <div className="col-md-9" key='2'>
            <h2 style={{ fontSize: 24 }}><b><a style={{ color: '#1200E7' }} href={this.props.videoUrl}>{this.props.title}</a></b></h2>
            {this.renderCaptionStamps(this.props.caption_match)}
          </div>
        </div>
    )
  }
})
