import React, {Component} from 'react'
import {PropTypes} from 'prop-types'
import Config from '../bigScheduler/config'

class ResourceView extends Component {

    constructor(props) {
        super(props);
    }

    static propTypes = {
        schedulerData: PropTypes.object.isRequired,
        browserScrollbarHeight: PropTypes.number.isRequired,
        slotClickedFunc: PropTypes.func,
        slotItemTemplateResolver: PropTypes.func
    }

    render() {

        const {schedulerData, browserScrollbarHeight, slotClickedFunc, slotItemTemplateResolver} = this.props;
        const {renderData} = schedulerData;

        let width = schedulerData.getResourceTableWidth() - 2;
        let paddingBottom = browserScrollbarHeight;
        let isFirstItem = true;

        const splitRowCssClass = (item) => {
            if(item.type === Config.resourceTypes.booking && isFirstItem) {
                isFirstItem = false;
                return "split-booking-row"
            }

            return '';
        }

        let resourceList = renderData.map((item) => {
            let colorSpan = item.color ? <span style={{backgroundColor: item.color, width: '2rem', height: '1rem',
                display: 'inline-block', verticalAlign: 'middle', marginRight: '10px', textAlign:'left'}}></span> : '';
            let a = slotClickedFunc != undefined ? <a onClick={() => {
                slotClickedFunc(schedulerData, item);
            }}>{item.slotName}</a>
                : <span>{colorSpan}<span>{item.slotName}</span></span>;

            let slotItem = (
                <div style={{width: width}} title={item.slotName} className="overflow-text header2-text">
                    {a}
                </div>
            );
            if(!!slotItemTemplateResolver) {
                let temp = slotItemTemplateResolver(schedulerData, item, slotClickedFunc, width, "overflow-text header2-text");
                if(!!temp)
                    slotItem = temp;
            }

            return (
                <tr key={item.slotId} className={splitRowCssClass(item)}>
                    <td data-resource-id={item.slotId} style={{height: item.rowHeight}}>
                        {slotItem}
                    </td>
                </tr>
            );
        });

        return (
            <div style={{paddingBottom: paddingBottom}}>
                <table className="resource-table">
                    <tbody>
                        {resourceList}
                    </tbody>
                </table>
            </div>
        )
    }
}

export default ResourceView