/* eslint-disable no-console */
import React, {Component} from 'react'
import moment from 'moment'

import Timeline from 'react-calendar-timeline/lib'

import 'bootstrap/dist/css/bootstrap.min.css';
import {
    Button, Modal, ModalHeader, ModalBody, ModalFooter,
    Form, FormGroup, Label, Input, FormText, Col
} from 'reactstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import {faClock, faPlusSquare} from '@fortawesome/fontawesome-free-solid'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

var minTime = moment()
    .add(-6, 'months')
    .valueOf()
var maxTime = moment()
    .add(6, 'months')
    .valueOf()

var keys = {
    groupIdKey: 'id',
    groupTitleKey: 'title',
    groupRightTitleKey: 'rightTitle',
    itemIdKey: 'id',
    itemTitleKey: 'title',
    itemDivTitleKey: 'title',
    itemGroupKey: 'group',
    itemTimeStartKey: 'start',
    itemTimeEndKey: 'end'
}
const DATA_KEY = 'EVENT_DATA';
export default class App extends Component {
    constructor(props) {
        super(props);

        const defaultTimeStart = moment()
            .startOf('month')
            .toDate()
        const defaultTimeEnd = moment()
            .startOf('month')
            .add(1, 'month')
            .toDate()
        this.state = {
            groups: [],
            items: [],
            defaultTimeStart: defaultTimeStart,
            defaultTimeEnd: defaultTimeEnd,
            timeSteps: {
                second: 60,
                minute: 15,
                hour: 1,
                day: 1,
                month: 1,
                year: 1
            },
            modal: false,
            modalCar: false,
            event: {
                carName: '',
                title: '',
                id: '',
                group: '',
                itemProps: {
                    'data-tip': ''
                },
                startDate: undefined,
                endDate: undefined
            },
            car: {
                id: ''
            }
        }
        this.toggle = this.toggle.bind(this);
        this.toggleAddCar = this.toggleAddCar.bind(this);
    }
    componentDidMount() {
        this.loadData();
    }

    loadData() {
        console.log('load data from local storage');
        var itemStr = localStorage.getItem(DATA_KEY);
        if(typeof (itemStr) != 'undefined' && itemStr != null) {
            var data = JSON.parse(itemStr);
            var self = this;
            data.items.map((item, index) => {
                item.start = moment(item.start);
                item.end = moment(item.end);
            });

            this.setState({
                groups: data.groups,
                items: data.items
            }, function(){
                console.log(self.state);
            });
        }
    }
    toggle() {
        this.setState({
            modal: !this.state.modal
        });
    }

    toggleAddCar() {
        this.setState({
            modalCar: !this.state.modalCar
        });
    }

    handleChangeValue(field, value) {
        var event = this.state.event;
        event[field] = value;

        this.setState({
            event: event
        });
    }

    handleChangeCarValue(field, value) {
        var car = this.state.car;
        car[field] = value;

        this.setState({
            car: car
        });
    }

    handleCanvasClick = (groupId, time) => {
        console.log('Canvas clicked', groupId, moment(time).format());
        var event = this.state.event;
        event.group = groupId;
        event.startDate = moment(time);
        event.endDate = moment(time).add(15, 'minute');
        var self = this;
        this.setState({
            event: event
        }, function () {
            self.toggle();
        });
    }

    handleCanvasDoubleClick = (groupId, time) => {
        console.log('Canvas double clicked', groupId, moment(time).format())
    }

    handleCanvasContextMenu = (group, time) => {
        console.log('Canvas context menu', group, moment(time).format())
    }

    handleItemClick = (itemId, _, time) => {
        console.log('Clicked: ' + itemId, moment(time).format())
    }

    handleItemSelect = (itemId, _, time) => {
        console.log('Selected: ' + itemId, moment(time).format())
    }

    handleItemDoubleClick = (itemId, _, time) => {
        console.log('Double Click: ' + itemId, moment(time).format())
    }

    handleItemContextMenu = (itemId, _, time) => {
        console.log('Context Menu: ' + itemId, moment(time).format())
    }

    handleItemMove = (itemId, dragTime, newGroupOrder) => {
        const {items, groups} = this.state

        const group = groups[newGroupOrder]

        this.setState({
            items: items.map(
                item =>
                    item.id === itemId
                        ? Object.assign({}, item, {
                        start: dragTime,
                        end: dragTime + (item.end - item.start),
                        group: group.id
                    })
                        : item
            )
        })

        console.log('Moved', itemId, dragTime, newGroupOrder)
    }

    handleItemResize = (itemId, time, edge) => {
        const {items} = this.state
        var self = this;
        this.setState({
            items: items.map(
                item =>
                    item.id === itemId
                        ? Object.assign({}, item, {
                        start: edge === 'left' ? time : item.start,
                        end: edge === 'left' ? item.end : time
                    })
                        : item
            )
        }, function() {
            self.saveItems(self.state.items);
        });

        console.log('Resized', itemId, time, edge)
    }

    // this limits the timeline to -6 months ... +6 months
    handleTimeChange = (visibleTimeStart, visibleTimeEnd, updateScrollCanvas) => {
        if (visibleTimeStart < minTime && visibleTimeEnd > maxTime) {
            updateScrollCanvas(minTime, maxTime)
        } else if (visibleTimeStart < minTime) {
            updateScrollCanvas(minTime, minTime + (visibleTimeEnd - visibleTimeStart))
        } else if (visibleTimeEnd > maxTime) {
            updateScrollCanvas(maxTime - (visibleTimeEnd - visibleTimeStart), maxTime)
        } else {
            updateScrollCanvas(visibleTimeStart, visibleTimeEnd)
        }
    }

    moveResizeValidator = (action, item, time) => {
        if (time < new Date().getTime()) {
            var newTime =
                Math.ceil(new Date().getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000)
            return newTime
        }

        return time
    }

    saveEvent(e) {
        e.preventDefault();
        var title = this.state.event.title;
        if(title == null || title == '') {
            alert('Vui lòng điền tiêu để');
            return false;
        }
        var startValue = this.state.event.startDate.toDate();
        var endValue = this.state.event.endDate.toDate();
        let item = {
            id: new Date().getTime() + Math.floor(Math.random() * 1000),
            group: this.state.event.group,
            title: this.state.event.title,
            start: startValue,
            end: endValue,
            canMove: startValue > new Date().getTime(),
            canResize: startValue > new Date().getTime() ? (endValue > new Date().getTime() ? 'both' : 'left') : (endValue > new Date().getTime() ? 'right' : false),
            className: (moment(startValue).day() === 6 || moment(startValue).day() === 0) ? 'item-weekend' : '',
            itemProps: {
                'data-tip': this.state.event.title
            }
        };
        this.addItem(item);
        this.loadData();
        this.toggle();
    }

    addItem(item) {
        let data = this.getDataFromLocalStorage(DATA_KEY);
        data = data == null ? {groups: [], items: []} : data;
        let items = data.items;
        items.push(item);
        this.saveDataToLocalStorage(DATA_KEY, data);
    }

    saveItems(items) {
        let data = this.getDataFromLocalStorage(DATA_KEY);
        data.items = items;
        this.saveDataToLocalStorage(DATA_KEY, data);
    }

    saveCar(e) {
        e.preventDefault();
        let data = this.getDataFromLocalStorage(DATA_KEY);
        data = data == null ? {groups: [], items: []} : data;

        let groups = data.groups;
        let carId = this.state.car.id;
        groups.push({
            id: carId,
            title: 'Xe ' + carId,
            rightTitle: carId,
        });

        this.saveDataToLocalStorage(DATA_KEY, data);
        this.loadData();
        this.setState({
            car: {
                id: ''
            }
        });
        this.toggleAddCar();
    }

    getDataFromLocalStorage(key) {
        var dataStr = localStorage.getItem(key);
        if(dataStr != null) {
            return JSON.parse(dataStr);
        }

        return null;
    }

    saveDataToLocalStorage(key, value) {
        localStorage.setItem(DATA_KEY, JSON.stringify(value));
    }

    render() {
        const {groups, items, timeSteps} = this.state;

        return (
            <div>
                <Timeline
                    groups={groups}
                    items={items}
                    keys={keys}
                    sidebarWidth={150}
                    sidebarContent={<div>Xe <Button color="success"
                                                    onClick={(e) => this.toggleAddCar()}><FontAwesomeIcon icon={faPlusSquare}/></Button></div>}
                    canMove={true}
                    canResize="both"
                    canSelect
                    itemsSorted
                    itemTouchSendsClick={false}
                    stackItems
                    itemHeightRatio={0.75}
                    showCursorLine
                    defaultTimeStart={this.state.defaultTimeStart}
                    defaultTimeEnd={this.state.defaultTimeEnd}
                    timeSteps={timeSteps}
                    onCanvasClick={this.handleCanvasClick.bind(this)}
                    onCanvasDoubleClick={this.handleCanvasDoubleClick}
                    onCanvasContextMenu={this.handleCanvasContextMenu}
                    onItemClick={this.handleItemClick}
                    onItemSelect={this.handleItemSelect}
                    onItemContextMenu={this.handleItemContextMenu}
                    onItemMove={this.handleItemMove}
                    onItemResize={this.handleItemResize}
                    onItemDoubleClick={this.handleItemDoubleClick}
                    onTimeChange={this.handleTimeChange}
                    moveResizeValidator={this.moveResizeValidator}
                />
                <Modal isOpen={this.state.modalCar} toggle={this.toggleAddCar} className="modal-md">
                    <ModalHeader toggle={this.toggleAddCar}>{ 'Thêm Xe'}</ModalHeader>
                    <ModalBody>
                        <FormGroup row>
                            <Col sm={12}>
                                <Input value={this.state.car.title} className="no-border-input" placeholder="Biển số xe"
                                       onChange={(e) => this.handleChangeCarValue('id', e.target.value)}/>
                            </Col>
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={(e) => this.saveCar(e)}>Lưu</Button>{' '}
                    </ModalFooter>
                </Modal>

                <Modal isOpen={this.state.modal} toggle={this.toggle} className="modal-md addEvent">
                    <ModalHeader toggle={this.toggle}>{ 'Thêm giờ xe chạy: ' + this.state.event.group}</ModalHeader>
                    <ModalBody>
                        <FormGroup row>
                            <Col sm={12}>
                                <Input value={this.state.event.title} className="no-border-input" placeholder="Tiêu đề"
                                       onChange={(e) => this.handleChangeValue('title', e.target.value)} required/>
                            </Col>
                        </FormGroup>
                        <FormGroup row className="event-datetime-picker">
                            <span className="icon-clock"><FontAwesomeIcon icon={faClock}/></span>
                            <DatePicker className="startDateEvent"
                                        selected={this.state.event.startDate}
                                        onChange={(date) => {
                                            this.handleChangeValue('startDate', date)
                                        }}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        dateFormat="LLL"
                                        timeCaption="Giờ"
                            />
                            <strong className="separate-time">{'-'}</strong>
                            <DatePicker className="endDateEvent"
                                        selected={this.state.event.endDate}
                                        minDate={this.state.event.startDate}
                                        onChange={(date) => {
                                            this.handleChangeValue('endDate', date)
                                        }}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        dateFormat="LLL"
                                        timeCaption="Giờ"
                            />
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={(e) => this.saveEvent(e)}>Lưu</Button>{' '}
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}
