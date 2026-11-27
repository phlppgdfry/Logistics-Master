using FluentValidation;
using ShipmentTracking.Application.Common.Interfaces;
using ShipmentTracking.Domain.Exceptions;
using System.Net;
using System.Text.Json;

namespace ShipmentTracking.WebAPI.Middleware;

public sealed class GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            // Strip CR/LF so a crafted path can't forge extra log lines.
            logger.LogError(ex, "Onbehandelde uitzondering voor {Method} {Path}",
                Sanitize(context.Request.Method), Sanitize(context.Request.Path.ToString()));
            await HandleExceptionAsync(context, ex);
        }
    }

    private static string Sanitize(string value) =>
        value.Replace("\r", string.Empty).Replace("\n", string.Empty);

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title, errors) = exception switch
        {
            ValidationException ve => (
                HttpStatusCode.BadRequest,
                "Validatiefout",
                ve.Errors.Select(e => e.ErrorMessage).ToList()),

            ShipmentNotFoundException => (
                HttpStatusCode.NotFound,
                exception.Message,
                new List<string>()),

            DomainException => (
                HttpStatusCode.UnprocessableEntity,
                exception.Message,
                new List<string>()),

            _ => (
                HttpStatusCode.InternalServerError,
                "Er is een onverwachte fout opgetreden.",
                new List<string>())
        };

        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var response = new
        {
            Status = (int)statusCode,
            Title = title,
            Errors = errors
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}

// CurrentUserService — leest claims uit JWT
public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public string UserId =>
        httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
        ?? "anonymous";

    public string UserName =>
        httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value
        ?? "anonymous";
}
