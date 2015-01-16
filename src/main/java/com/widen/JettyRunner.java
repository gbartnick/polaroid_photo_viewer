package com.widen;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.ProxySelector;
import java.net.URI;
import java.net.URL;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.security.ProtectionDomain;
import java.util.List;
import java.util.concurrent.TimeUnit;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.ParameterException;
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.ForwardedRequestCustomizer;
import org.eclipse.jetty.server.HttpConfiguration;
import org.eclipse.jetty.server.HttpConnectionFactory;
import org.eclipse.jetty.server.SecureRequestCustomizer;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.server.SessionManager;
import org.eclipse.jetty.server.SslConnectionFactory;
import org.eclipse.jetty.util.component.AbstractLifeCycle;
import org.eclipse.jetty.util.component.LifeCycle;
import org.eclipse.jetty.util.log.Log;
import org.eclipse.jetty.util.ssl.SslContextFactory;
import org.eclipse.jetty.webapp.WebAppContext;

public class JettyRunner
{

    public static void main(String[] args)
    {
        try
        {
            final JettyRunnerOptions options = new JettyRunnerOptions();
            JCommander parser = new JCommander(options);
            try
            {
                parser.parse(args);

                if (options.help)
                {
                    parser.usage();
                    return;
                }
            }
            catch (ParameterException e)
            {
                System.err.println(e.getMessage());
                return;
            }

            List<Proxy> select = ProxySelector.getDefault().select(new URI("http://foo/bar"));
            for (Proxy proxy : select)
            {
                if (proxy.address() != null)
                {
                    InetSocketAddress address = (InetSocketAddress) proxy.address();
                    System.setProperty("http.proxyHost", address.getHostName());
                    System.setProperty("http.proxyPort", Integer.toString(address.getPort()));
                    System.setProperty("https.proxyHost", address.getHostName());
                    System.setProperty("https.proxyPort", Integer.toString(address.getPort()));
                    break;
                }
            }

            // http://www.eclipse.org/jetty/documentation/9.1.3.v20140225/configuring-connectors.html
            // http://git.eclipse.org/c/jetty/org.eclipse.jetty.project.git/tree/examples/embedded/src/main/java/org/eclipse/jetty/embedded/ManyConnectors.java

            // If a fixed thread pool is required
            // QueuedThreadPool threadPool = new QueuedThreadPool(100, 10);
            // Server server = new Server(threadPool);

            Server server = new Server();
            server.setStopAtShutdown(true);
            server.addLifeCycleListener(new JettyLifeCycleListener(options));

            HttpConfiguration httpConfiguration = new HttpConfiguration();
            httpConfiguration.setSecureScheme("https");
            httpConfiguration.setSecurePort(options.sslport);
            httpConfiguration.setOutputBufferSize(32768);
            httpConfiguration.addCustomizer(new ForwardedRequestCustomizer()); // X-Forwarded-For

            ServerConnector http = new ServerConnector(server, new HttpConnectionFactory(httpConfiguration));
            http.setPort(options.port);
            http.setIdleTimeout(TimeUnit.SECONDS.toMillis(30));

            String keystore = JettyRunner.class.getResource("localhost-yden-us.jks").toExternalForm();
            SslContextFactory sslContextFactory = new SslContextFactory();
            sslContextFactory.setKeyStorePath(keystore);
            sslContextFactory.setCertAlias("localhost-yden-us");
            sslContextFactory.setKeyStorePassword("changeit");

            HttpConfiguration httpsConfiguration = new HttpConfiguration(httpConfiguration);
            httpsConfiguration.setOutputBufferSize(32768);
            httpsConfiguration.addCustomizer(new SecureRequestCustomizer());

            ServerConnector https = new ServerConnector(server, new SslConnectionFactory(sslContextFactory, "HTTP/1.1"), new HttpConnectionFactory(httpsConfiguration));
            https.setPort(options.sslport);
            https.setIdleTimeout(TimeUnit.SECONDS.toMillis(30));

            server.setConnectors(new Connector[] { http, https });

            ProtectionDomain domain = JettyRunner.class.getProtectionDomain();
            URL warCodeSource = domain.getCodeSource().getLocation();

            Log.getLog().info("Running Jetty from: " + warCodeSource.toExternalForm());

            WebAppContext context = new WebAppContext();
            context.setInitParameter("org.eclipse.jetty.servlet.Default.dirAllowed", "false");
            context.setInitParameter(SessionManager.__CheckRemoteSessionEncoding, "true"); // Stops Jetty from adding 'jsessionid' URL rewriting into non-local URLs (e.g. Google OpenId redirects)
            context.addSystemClass("com.widen.JettyRunnerOptions"); // fix CCE when launching via "jar -jar"
            context.setAttribute("app.args", options); // pass runtime options to servlet context
            context.setContextPath("/");
            context.setServer(server);

            if (warCodeSource.toExternalForm().toLowerCase().endsWith(".war"))
            {
                Path war = Paths.get(warCodeSource.getFile());
                Path warTempDir = war.resolveSibling(war.getFileName().toString().replace('.', '-') + "-temp");
                Log.getLog().info("Deploying as self-contained WAR at: {}", warTempDir.toAbsolutePath());

                cleanTempDir(warTempDir);
                context.setTempDirectory(warTempDir.toFile());

                context.setDescriptor(warCodeSource + "/WEB-INF/web.xml");
                context.setWar(warCodeSource.toExternalForm());
            }
            else
            {
                Log.getLog().info("Deploying in WAR-exploded mode");
                context.setWar("web");
            }

            server.setHandler(context);
            server.start();
            server.join();
        }
        catch (Exception e)
        {
            System.err.println("-- Error starting Jetty --");
            e.printStackTrace();
        }
    }

    private static void cleanTempDir(Path dir) throws IOException
    {
        if (!Files.exists(dir))
        {
            return;
        }

        Log.getLog().info("Removing temp directory at '{}'", dir);

        Files.walkFileTree(dir, new SimpleFileVisitor<Path>()
        {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException
            {
                Files.delete(file);
                return FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException
            {
                Files.delete(dir);
                return FileVisitResult.CONTINUE;
            }
        });
    }

    private static class JettyLifeCycleListener extends AbstractLifeCycle.AbstractLifeCycleListener
    {
        private final JettyRunnerOptions options;

        public JettyLifeCycleListener(JettyRunnerOptions options)
        {
            this.options = options;
        }

        @Override
        public void lifeCycleStarting(LifeCycle event)
        {
            Log.getLog().info("Jetty starting on HTTP {} and HTTPS {}...", options.port, options.sslport);
        }

        @Override
        public void lifeCycleStarted(LifeCycle event)
        {
            Log.getLog().info("Jetty ready to accept requests on HTTP {} and HTTPS {}...", options.port, options.sslport);
        }

        @Override
        public void lifeCycleFailure(LifeCycle event, Throwable cause)
        {
            Log.getLog().warn("Error starting Jetty: " + cause.getMessage(), cause);
        }

        @Override
        public void lifeCycleStopping(LifeCycle event)
        {
            Log.getLog().info("Stopping Jetty...");
        }

        @Override
        public void lifeCycleStopped(LifeCycle event)
        {
            Log.getLog().info("Jetty stopped.");
        }
    }
}
