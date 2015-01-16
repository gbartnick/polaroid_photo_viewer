package com.widen;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.beust.jcommander.IParameterValidator;
import com.beust.jcommander.Parameter;
import com.beust.jcommander.ParameterException;
import com.beust.jcommander.Parameters;

@Parameters
public class JettyRunnerOptions
{

    public static final List<String> ENVIRONMENTS = Arrays.asList("LOCAL", "STAGING", "PRODUCTION");

    @Parameter(names = { "-port", "-p" }, description = "HTTP port")
    public int port = 8090;

    @Parameter(names = { "-sslport", "-sp" }, description = "Secure HTTPS port")
    public int sslport = 8453;

    @Parameter(names = { "-environment", "-e" }, description = "Application environment: LOCAL | STAGING | PRODUCTION", required = true, validateWith = EnvironmentValidator.class)
    public String environment;

    @Parameter(names = { "-help" }, description = "Show this help text")
    public boolean help;

    @Override
    public String toString()
    {
        return String.format("args = { environment, = %s port = %d, sslport = %d }", environment, port, sslport);
    }

    public Map<String, String> getTapestrySymbols()
    {
        Map<String, String> map = new HashMap<>();
        map.put("app.http.http-port", String.valueOf(port));
        map.put("app.http.ssl-http-port", String.valueOf(sslport));
        map.put("app.environment", environment);
        return map;
    }

    public static class EnvironmentValidator implements IParameterValidator
    {
        @Override
        public void validate(String name, String value) throws ParameterException
        {
            if (!ENVIRONMENTS.contains(value))
            {
                throw new ParameterException("environment must be one of: " + ENVIRONMENTS);
            }
        }
    }

}
