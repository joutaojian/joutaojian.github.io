**1、Filter过滤器 与 Interceptor拦截器 的区别**
1.Filter是Servlet支持的，Interceptor是SpringMVC自己实现的 
2.Filter对所有请求起作用，Intercptor可以设置拦截规则（只对经过DispatchServlet的请求起作用）
3.Filter只能拿到request和response，interceptor可以拿到整个请求上下文（包括request和response）
4.Filter基于函数回调，Interceptor 基于反射AOP

**2、优先级问题**
1.Filter优先于Interceptor
2.Filter可以指定不同Filter的顺序，Interceptor可以指定不同Interceptor的顺序
![image.png](https://upload-images.jianshu.io/upload_images/3796089-24cb85eaffd12770.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**3、应用场景**
Filter：记录各个url的访问qps、插入数据到ThreadLocal供后续使用
Interceptor：token校验，sign校验，封禁校验等等


**4、Filter代码**
1.写具体实现
2.注册
```java
import java.io.IOException;
import java.time.LocalDateTime;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

public class TimeLogFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("TimeLogFilter init,"+LocalDateTime.now());
    }
 
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        long start = System.currentTimeMillis();
        filterChain.doFilter(servletRequest,servletResponse);
        long end = System.currentTimeMillis();
        long time = end - start;
        String url = ((HttpServletRequest)servletRequest).getServletPath();
        System.out.println("TimeLogFilter."+time+","+url);
    }
 
    @Override
    public void destroy() {
 
    }
}

/* 注册 */
@Bean
public FilterRegistrationBean registFilter() {
		FilterRegistrationBean registration = new FilterRegistrationBean();
		registration.setFilter(new TimeLogFilter());
		registration.addUrlPatterns("/*");
		registration.setName("TimeLogFilter");
		registration.setOrder(1);
		return registration;
	}	
```

**5、Interceptor代码**
1.写具体实现
2.注册
```java

@Order(TOKEN)
@Component
public class TokenInterceptor extends CommonInterceptor implements HandlerInterceptor {

    private static Logger logger = LoggerFactory.getLogger(TokenInterceptor.class);

    @Autowired
    TokenManager tokenManager;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        try{
            if(gray(request)){
                return true;
            }

            long kugouId = Long.parseLong(request.getParameter("std_kid"));
            int appid = Integer.parseInt(request.getParameter("appid"));
            String token = request.getParameter("token");
            if(tokenManager.checkToken(kugouId,appid,token,request)){
                return true;
            }

        }catch (Exception e){
            logger.error("TokenInterceptor err");
        }

        //err
        returnJson(response);
        return false;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
    }

    private void returnJson(HttpServletResponse response){
        PrintWriter writer = null;
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=utf-8");
        try {
            writer = response.getWriter();
            writer.print(ApplicationResponse.failure(TOKEN_ERR.code(),TOKEN_ERR.message()).toJsonString());
        } catch (IOException e){
            logger.error("TokenInterceptor returnJson err");
        } finally {
            if(writer != null){
                writer.close();
            }
        }
    }

    @Override
    protected boolean gray(HttpServletRequest request) {
        return checkMethod(request);
    }
}


/*注册*/


@Configuration
public class WebConfigurer implements WebMvcConfigurer {

	/**
	 * 拦截器Order
	 */
	public static final int SIGN = 1;
	public static final int TOKEN = 2;
	public static final int BAN = 3;

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		// 拦截所有请求
		registry.addInterceptor(BanInterceptor()).addPathPatterns("/**");
		registry.addInterceptor(SignInterceptor()).addPathPatterns("/**");
		registry.addInterceptor(TokenInterceptor()).addPathPatterns("/**");
	}

...

	@Bean
	public BanInterceptor BanInterceptor() {
		 return new BanInterceptor();
	 }
	 
	@Bean
	public SignInterceptor SignInterceptor() {
		 return new SignInterceptor();
	 }

	@Bean
	public TokenInterceptor TokenInterceptor() {
		return new TokenInterceptor();
	}
}



```
