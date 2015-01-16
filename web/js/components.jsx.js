(function (React, Reflux, AssetsActions, AssetsStore, global) {
    var Link = ReactRouter.Link;
    var Route = ReactRouter.Route;
    var DefaultRoute = ReactRouter.DefaultRoute;
    var RouteHandler = ReactRouter.RouteHandler;

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
        handleSearch: function (evnt) {
            var note = evnt.target.value;
            if (evnt.which === 13 && note) {
                AssetsActions.addNote(note);
                evnt.target.value = '';
            }
        },

        render: function () {
            var txtStyle = {
                width: '350px'
            };
            return (
                <div id="searchAssets" className="container">
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
        render: function () {
            return (
                <div>
                    {
                        this.props.list.map(function (asset) {
                            return <AssetItem asset={asset} key={asset.uuid}/>;
                        })
                    }
                </div>
            )
        }
    });

    var AssetItem = React.createClass({
        mixins: [React.addons.LinkedStateMixin],
        getInitialState: function () {
            return {isEditing: false};
        },
        render: function () {
            var tempVal = Math.round(Math.random());
            if(tempVal == 1) {
                var rotDegrees = randomXToY(330, 360); // rotate left
            } else {
                var rotDegrees = randomXToY(0, 30); // rotate right
            }

            // Internet Explorer doesn't have the "window.innerWidth" and "window.innerHeight" properties
            if(window.innerWidth == undefined) {
                var wiw = 1000;
                var wih = 700;
            } else {
                var wiw = window.innerWidth;
                var wih = window.innerHeight;
            }
            var divStyle = {
                'left' : Math.random()*(wiw-400),
                'top' : Math.random()*(wih-400),
                '-webkit-transform' : 'rotate('+ rotDegrees +'deg)',  // safari only
                'transform' : 'rotate('+ rotDegrees +'deg)'
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
                </div>
            );
        }
    });

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
