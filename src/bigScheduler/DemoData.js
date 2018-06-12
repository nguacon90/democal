const DemoData = {
    resources: [
        {
            id: 'r1',
            name: '30L7-2259',
            type: 'car'
        },
        {
            id: 'r2',
            name: '30L7-2259',
            type: 'car'
        },
        {
            id: 'r3',
            name: '29M6-2258',
            type: 'car'
        },
        {
            id: 'r4',
            name: '30K7-1257',
            type: 'car'
        },
        {
            id: 'r5',
            name: '30F7-3359',
            type: 'car'
        },
        {
            id: 'r6',
            name: '30L9-1159',
            type: 'car'
        },
        {
            id: 'r7',
            name: '30L7-3434',
            type: 'car'
        },
        {
            type: 'booking',
            id: 'b1',
            name: '7 chỗ',
        },
        {
            type: 'booking',
            id: 'b2',
            name: '16 chỗ',
        },
        {
            type: 'booking',
            id: 'b3',
            name: '35 chỗ',
        },
        {
            type: 'booking',
            id: 'b4',
            name: '45 chỗ',
        }
    ],
    events: [
        {
            id: 1,
            start: '2018-06-12 09:30:00',
            end: '2018-06-16 23:30:00',
            resourceId: 'b1',
            title: 'Hà Nội - Hải Phòng',
            bgColor: '#33d959',
            removable: true
        },
        {
            id: 1,
            start: '2018-06-12 09:30:00',
            end: '2018-06-14 23:30:00',
            resourceId: 'b2',
            title: 'Hà Nội - Đà nẵng',
            bgColor: '#33d959',
            removable: true
        },
        {
            id: 1,
            start: '2018-06-15 09:30:00',
            end: '2018-06-16 23:30:00',
            resourceId: 'b4',
            title: 'Hà Nội - Hải Dương',
            bgColor: '#33d959',
            removable: true
        }
    ]
}

export default DemoData
