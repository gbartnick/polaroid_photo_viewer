(function (React, Reflux, AssetsActions, AssetsStore, global) {
    var Link = ReactRouter.Link;
    var Route = ReactRouter.Route;
    var DefaultRoute = ReactRouter.DefaultRoute;
    var RouteHandler = ReactRouter.RouteHandler;
    // var Draggable = ReactDraggable;

    var App = React.createClass({
        render: function () {
            var containerStyle = {
                margin: '5px'
            };

            return (
                <div>
                {/*<header>
                        <ul className="nav nav-tabs">
                            <NavLink to="assets" activeClassName="active">Assets</NavLink>
                            <NavLink to="collections" activeClassName="active">Collections</NavLink>
                        </ul>
                    </header>*/}
                    <div style={containerStyle}>
                        <RouteHandler/>
                    </div>
                </div>
            );
        }
    });

    var NavLink = React.createClass({
        mixins: [ReactRouter.Navigation, ReactRouter.State],

        render: function() {
            var className;
            if (this.props.activeClassName && this.isActive(this.props.to, this.props.params, this.props.query)) {
                className = this.props.activeClassName;
            }
            return (
                <li role="presentation" className={className}>
                    <Link activeClassName="" to={this.props.to} params={this.props.params} query={this.props.query} onClick={this.props.onClick}>{this.props.children}</Link>
                </li>
            );
        }
    });

    var AssetPage = React.createClass({
        mixins: [Reflux.connect(AssetsStore, "list")],
        render: function () {
            return (<div>
                <br/>
                <AssetSearch></AssetSearch>
                <br/>
                <AssetList list={this.state.list}></AssetList>
            </div>
            );
        }
    });

    var CollectionPage = React.createClass({
        mixins: [Reflux.connect(AssetsStore, "list")],
        render: function () {
            return (
                <div>
                    <h2>Collections</h2>
                </div>
            );
        }
    });


    var AssetSearch = React.createClass({
        getInitialState: function() {
            return {query: 'fn:(kitten or puppies)'};
        },

        handleSearch: function (evnt) {
            //setState({
            //    query: evnt.target.value
            //});
            var query = evnt.target.value;
            if (evnt.which === 13 && query) {
                AssetsActions.search(query);
                //evnt.target.value = '';
            }
        },

        render: function () {
            var txtStyle = {
                width: '350px'
            };
            return (
                <div id="asset-search" className="container">
                    <div className="row">
                        <span className="col-md-6">
                            <input type="text" style={txtStyle} className="form-control" placeholder="Find Assets" onKeyUp={this.handleSearch}/>
                        </span>
                    </div>
                </div>
            );
        }
    });

    var AssetList = React.createClass({
        propTypes: {
            list: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
        },
        getInitialState: function () {
            return {highIndex: 1, dragging: false};
        },
        incrementHighIndex: function () {
            setState({
                highIndex: this.state.highIndex + 1
            });
        },
        componentDidMount: function () {

        },
        render: function () {
            if (this.props.list.length > 0) {
                return (
                    <div id="asset-list">
                    {
                        this.props.list.map(function (asset) {
                            //return <Draggable onMouseDown={this.incrementHighIndex}><AssetItem asset={asset} key={asset.uuid}/></Draggable>;
                            return <AssetItem asset={asset} key={asset.uuid}/>;
                        })
                    }
                    </div>
                )
            } else {
                return (
                    <div id="asset-list">
                    </div>
                )
            }
        }
    });

    var dragging = false;
    var highIndex = 1;
    var AssetItem = React.createClass({
        mixins: [React.addons.LinkedStateMixin],
        getInitialState: function () {
            var wiw, wih;
            // Internet Explorer doesn't have the "window.innerWidth" and "window.innerHeight" properties
            if(window.innerWidth == undefined) {
                wiw = 1000;
                wih = 700;
            } else {
                wiw = window.innerWidth;
                wih = window.innerHeight;
            }
            var x = Math.random()*(wiw-400);
            var y = Math.random()*(wih-400);

            var rotDegrees;
            var tempVal = Math.round(Math.random());
            if(tempVal == 1) {
                rotDegrees = MyUtils.randomXToY(330, 360); // rotate left
            } else {
                rotDegrees = MyUtils.randomXToY(0, 30); // rotate right
            }

            return {
                isEditing: false,
                dragging: false,
                highIndex: 1,
                left: x,
                top: y,
                rotDegrees: rotDegrees
            };
        },
        incrementHighIndex: function () {
            setState({
                highIndex: this.state.highIndex + 1
            });
        },
        removeItem: function() {
            AssetsActions.deleteAsset(this.props.asset.uuid);
        },
        componentDidMount: function () {
            var polaroid = $(this.getDOMNode());
            // Show the polaroid on top when clicked on
            polaroid.mouseup(function(e){
                if(!dragging) {
                    // Bring polaroid to the foreground
                    highIndex++;
                    var cssObj = { 'z-index' : highIndex,
                        'transform' : 'rotate(0deg)',	 // added in case CSS3 is standard
                        '-webkit-transform' : 'rotate(0deg)' };  // safari only
                    $(this).css(cssObj);
                }
            });

            // Make the polaroid draggable & display a shadow when dragging
            polaroid.draggable({
                cursor: 'crosshair',
                start: function(event, ui) {
                    dragging = true;
                    highIndex++;
                    var cssObj = { 'box-shadow' : '#888 5px 10px 10px', // added in case CSS3 is standard
                        '-webkit-box-shadow' : '#888 5px 10px 10px', // safari only
                        'margin-left' : '-10px',
                        'margin-top' : '-10px',
                        'z-index' : highIndex };
                    $(this).css(cssObj);
                },
                stop: function(event, ui) {
                    //var tempVal = Math.round(Math.random());
                    //if(tempVal == 1) {
                    //    var rotDegrees = MyUtils.randomXToY(330, 360); // rotate left
                    //} else {
                    //    var rotDegrees = MyUtils.randomXToY(0, 30); // rotate right
                    //}
                    var cssObj = { 'box-shadow' : '', // added in case CSS3 is standard
                        '-webkit-box-shadow' : '', // safari only
                        //'transform' : 'rotate('+ rotDegrees +'deg)', // added in case CSS3 is standard
                        //'-webkit-transform' : 'rotate('+ rotDegrees +'deg)', // safari only
                        'margin-left' : '0px',
                        'margin-top' : '0px' };
                    $(this).css(cssObj);
                    dragging = false;
                }
            });
        },
        render: function () {
            var divStyle = {
                'left' : this.state.left,
                'top' : this.state.top,
                '-webkit-transform' : 'rotate('+ this.state.rotDegrees +'deg)',  // safari only
                'transform' : 'rotate('+ this.state.rotDegrees +'deg)'
            };

            var classes = React.addons.classSet({
                'polaroid': true,
                // 'view': !this.state.isEditing,
                'editing': this.state.isEditing
            });

            var imgSrc = this.props.asset.previews.preview300.replace('https', 'http');

            return (
                <div className={classes} style={divStyle}>
                    <img src={imgSrc} alt={this.props.asset.name} />
                    <p>{this.props.asset.name}</p>
                    <span className="btn-remove-item btn btn-primary btn-sm" onClick={this.removeItem}>
                        <i className='glyphicon glyphicon-remove'></i>
                    </span>
                </div>
            );
        }
    });

    var Draggable = React.createClass({
      getDefaultProps: function () {
        return {
          // allow the initial position to be passed in as a prop
          initialPos: {x: 0, y: 0}
        }
      },
      getInitialState: function () {
        return {
          pos: this.props.initialPos,
          dragging: false,
          rel: null // position relative to the cursor
        }
      },
      // we could get away with not having this (and just having the listeners on
      // our div), but then the experience would be possibly be janky. If there's
      // anything w/ a higher z-index that gets in the way, then you're toast,
      // etc.
      componentDidUpdate: function (props, state) {
        if (this.state.dragging && !state.dragging) {
          document.addEventListener('mousemove', this.onMouseMove)
          document.addEventListener('mouseup', this.onMouseUp)
        } else if (!this.state.dragging && state.dragging) {
          document.removeEventListener('mousemove', this.onMouseMove)
          document.removeEventListener('mouseup', this.onMouseUp)
        }
      },

      // calculate relative position to the mouse and set dragging=true
      onMouseDown: function (e) {
        // only left mouse button
        if (e.button !== 0) return
        var pos = $(this.getDOMNode()).offset()
        this.setState({
          dragging: true,
          rel: {
            x: e.pageX - pos.left,
            y: e.pageY - pos.top
          }
        })
        e.stopPropagation()
        e.preventDefault()
      },
      onMouseUp: function (e) {
        this.setState({dragging: false})
        e.stopPropagation()
        e.preventDefault()
      },
      onMouseMove: function (e) {
        if (!this.state.dragging) return
        this.setState({
          pos: {
            x: e.pageX - this.state.rel.x,
            y: e.pageY - this.state.rel.y
          }
        })
        e.stopPropagation()
        e.preventDefault()
      },
      render: function () {
        // transferPropsTo will merge style & other props passed into our
        // component to also be on the child DIV.
        return this.transferPropsTo(React.DOM.div({
          onMouseDown: this.onMouseDown,
          style: {
            position: 'absolute',
            left: this.state.pos.x + 'px',
            top: this.state.pos.y + 'px',
            zIndex: this.props.highIndex
          }
        }, this.props.children))
      }
    })


    var routes = (
        <Route name="app" path="/" handler={App}>
            <Route name="assets" handler={AssetPage}/>
            <Route name="collections" handler={CollectionPage}/>
            <DefaultRoute handler={AssetPage}/>
        </Route>
    );

    ReactRouter.run(routes, function (Handler) {
        React.render(<Handler/>, document.getElementById('viewerApp'));
    });
})(window.React, window.Reflux, window.AssetsActions, window.AssetsStore, window);
