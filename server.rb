require 'sinatra'
require 'json'
require 'pry'
require 'librato/metrics'

Librato::Metrics.authenticate ENV['API_EMAIL'], ENV['API_TOKEN']

post '/' do
  queue = Librato::Metrics::Queue.new
  headers \
    "Access-Control-Allow-Credentials" => "true",
    "Access-Control-Allow-Headers" => "*",
    "Access-Control-Allow-Methods" => "*",
    "Access-Control-Allow-Origin" => "*"

  req = JSON.parse(request.body.read)

  req.each do |metric|
    queue.add metric
  end

  queue.submit
end
