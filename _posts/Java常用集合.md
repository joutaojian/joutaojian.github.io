ArrayList，LinkedList，CopyOnWriteList和Vector的区别

CopyOnWriteList：https://blog.csdn.net/linsongbin1/article/details/54581787
集合：https://www.jianshu.com/p/b54f1df33f84

HashTable，HashMap，HashSet，ConcurrentHashMap的区别
Java8中Stream的使用

| 接口 | 实现 | 普通 | 链表| 有序 |线程安全 | 并发性能线程安全 | 有序+并发性能线程安全 | 
| ------ | --------- | --------- | ------------ | --------------- |---------- |---------- |---------- |
| Collection | List | ArrayList | LinkedList |——| Vector | CopyOnWriteList | ——|
| Collection | Set| HashSet | —— |TreeSet| ——| CopyOnWriteArraySet| ConcurrentSkipListSet|
| Collection | Queue| ——| —— |——| ——| ConcurrentLinkedQueue，LinkedBlockingQueue，ArrayBlockingQueue| ——|
| Map| —— | HashMap | LinkedHashMap |HashTree | HashTable | ConcurrentHashMap| ConcurrentSkipListMap|
