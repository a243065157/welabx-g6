<template>
    <div class="root">
        <div
            id="headPanel"
            :class="{ hidden: headVisible }"
        >
            <span class="logo">logo</span>
            <i
                class="gb-toggle-btn"
                @click="headVisible = !headVisible"
            />
        </div>
        <!-- 左侧按钮 -->
        <item-panel
            :graph="graph"
            @canvas-add-node="addNode"
            @canvas-add-edge="addEdge"
        />
        <!-- 浮动工具条 -->
        <div id="toolbar">
            <i
                class="iconfont icon-undo"
                @click="addNode"
            />
            <i
                class="iconfont icon-redo"
                @click="addNode"
            />
            <i class="split" />
            <i
                class="iconfont icon-copy"
                @click="copyNode"
            />
            <i
                class="iconfont icon-paste"
                @click="addNode"
            />
            <i class="split" />
            <i
                class="iconfont icon-line-style"
                @click="addNode"
            />
            <i
                class="iconfont icon-line-strong"
                @click="addNode"
            />
            <i class="split" />
            <i
                class="iconfont icon-toup"
                @click="addNode"
            />
            <i
                class="iconfont icon-todown"
                @click="addNode"
            />
            <i class="split" />
            <i
                class="iconfont icon-font-size"
                @click="addNode"
            />
            <i
                class="iconfont icon-actual-size"
                @click="addNode"
            />
            <i
                class="iconfont icon-full-screen"
                @click="addNode"
            />
        </div>
        <!-- 挂载节点 -->
        <div
            id="canvasPanel"
            @dragover.prevent
        />
        <!-- 配置面板 -->
        <div
            id="configPanel"
            :class="{ hidden: !configVisible }"
        >
            <h2 class="panel-title">数据配置</h2>
            <i
                class="gb-toggle-btn"
                @click="configVisible = !configVisible"
            />
            <div class="config-data">
                {{ config }}
            </div>
        </div>
    </div>
</template>

<script>
    import G6 from '../../components/graph/graph';
    import ItemPanel from './ItemPanel.vue';
    import data from './data.js';

    export default {
        components: {
            ItemPanel,
        },
        data () {
            return {
                graph:     {},
                highLight: {
                    undo: false,
                    redo: false,
                },
                // 保存线条样式
                lineStyle: {
                    type:  'line',
                    width: 1,
                },
                headVisible:   false,
                configVisible: false,
                config:        {

                },
            };
        },
        mounted () {
            // 创建画布
            this.$nextTick(() => {
                this.createGraphic();
                this.initGraphEvent();
            });
        },
        beforeDestroy () {
            this.graph.destroy();
        },
        methods: {
            createGraphic () {
                const graph = new G6();

                // 自定义注册行为, 事件, 交互
                /* graph.registerFactory(G6 => {
                    console.log(G6);
                }); */

                this.graph = graph.instance;
                this.graph.read(data);
                this.graph.paint();
                // this.graph.fitView();
            },
            // 复制节点
            copyNode () { },
            // 粘贴节点
            paste () { },
            // 添加节点
            addNode (e) {
                const model = {
                    label: 'node',
                    // id:    Util.uniqueId(),
                    // 形状
                    type:  'rect-node', // e.target.dataset.shape
                    // 坐标
                    x:     e.clientX - 50,
                    y:     e.clientY + 200,
                };

                this.graph.addItem('node', model);
            },
            // 添加 edge
            addEdge (e) {
                const model = {
                    // id:    Util.uniqueId(),
                    label: 'edge',
                };

                this.graph.addItem('edge', model);
            },
            // 初始化图事件
            initGraphEvent() {
                this.graph.on('after-node-selected', data => {
                    this.configVisible = !!data;

                    if(data) {
                        this.config = {
                            id: data._cfg.id,
                        };
                    }
                });

                this.graph.on('after-edge-selected', data => {
                    this.configVisible = !!data;

                    if(data) {
                        this.config = {
                            id: data._cfg.id,
                        };
                    }
                });
            },
        },
    };
</script>
