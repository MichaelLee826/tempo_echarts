var body = global.body;
//保存echarts图形对象
var chart = null;
//判断是否设置横竖屏有变动
var hasorientationchange = false;
//外部参数，如筛选器，联动参数，形如：[{name:'age',value:23}]
var params = global.params;

var date;
var train;
var value;
var data_value;
var data_overload;
//console.log(echarts.version);

//x轴坐标
var xAxis = [];
//y轴坐标
var yAxis = [];
//最大值
var max = 0;
//最小值
var min = 0;

/**
* 渲染图形
*/
function renderChart(data){
   chart.setOption({
     	title:{
        	text: '地铁1号线2019年1~3月载荷分析结果',
        	textStyle: {
            	color: '#ffffff',
              	fontSize: 24
        	},
          	left: 'center'
    	},
	  tooltip: {
        position: 'top',
        formatter: function (params) {
          	if(params.componentIndex == 0){
              return '<p>日期：'+params.value[0]+'</p><p>列车号：'+params.value[1]+'</p><p>人数：'+params.value[2]+'</p>';
            }
          	else{
              return '<p>日期：'+params.value[0]+'</p><p>列车号：'+params.value[1]+'</p><p>超载人数：'+params.value[2]+'</p>';
            }
        },
        padding: [0, 15],
        confine: true,
        transitionDuration: 1,
        backgroundColor: '#123456aa',
        textStyle:{
          	color: '#ffffff',
          	lineHeight: 30
        },
        //extraCssText:'width:100px;height:100px'
    },
    animation: true,
    grid: {
        height: '80%',
      	width: '85%',
      	x: '12%',
        y: '8%'
    },
    xAxis: {
        type: 'category',
        data: xAxis,
      	axisPointer:{
        	show: false
        },
        splitArea: {
            show: true
        },
      	axisLabel:{
            rotate: 45,
            color: '#ffffff'
        },
      	name: '日期',
        nameLocation: 'center',
        nameGap: 80,
      	nameTextStyle: {
            color: '#ffffff',
            fontSize: 15,
        }
    },
    yAxis: {
        type: 'category',
        data: yAxis,
      	axisPointer:{
     	   	show: false
        },
        splitArea: {
            show: true
        },
      	axisLabel:{
            color: '#ffffff',
        },
      	name: '列车号',
        nameLocation: 'center',
        nameGap: 50,
      	nameTextStyle: {
            color: '#ffffff',
            fontSize: 15,
        }
    },
    visualMap: [
        {
          	seriesIndex: [0],
            min: min,
            max: max,
            calculable: true,
            orient: 'vertical',
            left: '0%',
            top: '30%',
            textStyle: {
                color: '#ffffff'
            },
            inRange: {
                color: ['rgb(246, 239, 166)', 'rgb(129, 161, 157)', 'rgb(11, 83, 148)']
            }
        },
        {
            seriesIndex: [1],
          	show: false,
            min: 0,
            max: 100,
            calculable: true,
            orient: 'vertical',
            left: 'right',
            top: '30%',
          	textStyle: {
                color: '#ffffff'
            },
            inRange: {
            	color: ['rgb(255, 0, 0)', 'rgb(255, 0, 0)', 'rgb(255, 0, 0)']
            }
        },
    ],
    series: [
        {
            name: '载荷人数',
            type: 'heatmap',
            data: data,
            label: {
                normal: {
                    show: false
                }
            },
            itemStyle: {
                color: '#000000'
            },
            emphasis: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        },
		{
            name: '过载',
            type: 'scatter',
          	symbolSize: function (val) {
                return val[2] / 100;
            },
            //data: [[0,0,5],[0,1,10],[1,1,20]]
            data: data_overload
        }
    ]
   })
}
/**
 * 初始化节点数据时触发
* @param {Object} data
*/
global.init = function(data) {
  	date = data.c0;
	train = data.c1;
	value = data.c2;
  	data_value = [];
  	data_overload = [];
  
  	//删除日期重复数据
  	for(var i = 0; i < date.length; i++){
	   if(xAxis.indexOf(date[i]) < 0){
			 xAxis.push(date[i]);
	   }
 	}
  	xAxis = xAxis.sort();
  	
  	//删除列车号重复数据
  	for(var i = 0; i < train.length; i++){
	   if(yAxis.indexOf(train[i]) < 0){
			 yAxis.push(train[i]);
	   }
	}
  	
	//根据坐标位置，填充车厢人数数据
	for(var i = 0; i < date.length; i ++){
		var temp = [];
		temp.push(date[i]);
		temp.push(train[i]);
		temp.push(value[i]);
		data_value.push(temp);
	}
  
  	//根据坐标位置，填充过载数据
  	for(var i = 0; i < date.length; i ++){
      	var overload_value;
      	var overload = value[i] - 8000;
      	if(overload < 0){
          	overload_value = 0;
        }
      	else{
        	overload_value = overload;
        }
		var temp = [];
		temp.push(date[i]);
		temp.push(train[i]);
		temp.push(overload_value);
		data_overload.push(temp);
	}  
  
  	//获得数据的值域范围
  	max = value[0];
	for(var i = 0; i < value.length - 1; i++){
    	max = max < value[i + 1] ? value[i + 1] : max
	}
  	min = value[0];
  	for(var i = 0; i < value.length - 1; i++){
    	min = min > value[i + 1] ? value[i + 1] : min
    }
  
  	//初始化图表
	chart = echarts.init(body.querySelector("#echarts"));
	renderChart(data_value);
	//对外发起联动
	chart.on('click', function(param){
		 global.postMessage({
			type:'connect',
			 data : {columnName:'c0',value:param.name}
		 });
	})
}

/**
 * 更新节点数据时触发
 * @param {Object} data
 * @param {Object} param 联动筛选的数据
 */
global.update = function(data, param) {
	renderChart(data);
}

/**
 * 窗口大小改变的时候触发
* @param {Event} e
*/
global.resize = function(e) {
   //如果横竖屏有变动，则不需要再resize事件中调整图形大小
	if(!hasorientationchange){
	   chart.resize();
	}
	hasorientationchange = false;
}

/**
 * 设备横屏竖屏切换时触发
 * @param {Object} e
 */
global.orientationchange = function(e) {
   chart.resize();
   hasorientationchange = true;
}